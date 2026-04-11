#!/usr/bin/env python3
"""
Medegenii — reminder_worker.py
================================

Worker Python orchestrant les rappels WhatsApp (texte + audio darija) pour les
rendez-vous des cabinets médicaux marocains. Exécuté par cron toutes les heures
sur le serveur dédié 91.106.102.37 :

    0 * * * * cd /opt/medegenii && /opt/medegenii/venv/bin/python scripts/reminder_worker.py

Pipeline pour chaque RDV éligible :
    1. Lecture Supabase (RDV + patient + médecin, filtre consentement CNDP)
    2. Génération audio darija/fr via edge-tts (gratuit, illimité)
    3. Conversion MP3 -> OGG/Opus via ffmpeg (format requis WhatsApp)
    4. Upload sur Supabase Storage (bucket audio-reminders)
    5. Envoi via WhatChimp API (BSP officiel Meta, $12/mois lifetime)
    6. Mise à jour des flags + log dans reminder_logs (observabilité)

Trois cas gérés en séquence dans main() :
    - Cas 1 : rappel H-18 (template payant -> ouvre la fenêtre 24h Meta)
    - Cas 2 : rappel H-2 (utility gratuit, dans la fenêtre 24h)
    - Cas 3 : post-consultation (utility gratuit, dans la fenêtre 24h)

Cas futurs (commentés en bas du fichier) :
    - Cas 4 : relance impayés J+3
    - Cas 5 : relance impayés J+7

Résilience :
    - try/except indépendant par RDV (un échec ne bloque pas les autres)
    - retry_count incrémenté à chaque échec, max 3
    - last_error stocké pour debug
    - reminder_logs trace toutes les exécutions (success/error/skipped)

Conformité CNDP :
    - filtre SQL `consent_whatsapp = true` côté patient
    - vérification supplémentaire dans patient_consents (belt-and-suspenders)
    - aucune donnée patient dans les logs stdout (uniquement IDs)
"""

from __future__ import annotations

import asyncio
import logging
import os
import subprocess
import sys
import tempfile
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import edge_tts
import httpx
from dotenv import load_dotenv
from supabase import Client, create_client


# ---------------------------------------------------------------------------
# Configuration & init
# ---------------------------------------------------------------------------

load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]  # service_role : RLS bypass
WHATCHIMP_API_KEY = os.environ["WHATCHIMP_API_KEY"]
WHATCHIMP_PHONE_ID = os.environ["WHATCHIMP_PHONE_ID"]
SUPABASE_STORAGE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "audio-reminders")

WHATCHIMP_BASE_URL = "https://api.whatchimp.com/v1"
MAX_RETRY = 3

# Logging : on ne logue jamais de données patient — uniquement des IDs.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger("reminder_worker")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Mapping voix edge-tts par langue
VOICES = {
    "fr": "fr-FR-DeniseNeural",
    "ar": "ar-MA-MounaNeural",
    "darija": "ar-MA-MounaNeural",
    "amazigh": "ar-MA-MounaNeural",  # fallback : darija (pas de voix amazigh)
}


@dataclass
class ReminderResult:
    """Résultat d'une tentative d'envoi pour un RDV."""

    appointment_id: str
    reminder_type: str
    status: str  # success | error | skipped_no_consent | skipped_dedup
    whatchimp_message_id: str | None = None
    audio_url: str | None = None
    error_message: str | None = None
    duration_ms: int = 0


# ---------------------------------------------------------------------------
# 1. Lecture Supabase
# ---------------------------------------------------------------------------


def get_pending_reminders(reminder_type: str) -> list[dict[str, Any]]:
    """Récupère les RDV éligibles pour un type de rappel donné.

    On utilise des RPC `pending_<type>` côté Postgres pour garder les filtres
    temporels (intervalles SQL) — bien plus propre que de les recalculer ici.
    Si le RPC n'existe pas, on retombe sur une requête SQL via execute_sql.
    """
    try:
        resp = supabase.rpc(f"pending_{reminder_type}").execute()
        return resp.data or []
    except Exception as exc:  # pragma: no cover - fallback
        log.warning("RPC pending_%s indisponible (%s) — fallback select.", reminder_type, exc)
        return _fallback_select(reminder_type)


def _fallback_select(reminder_type: str) -> list[dict[str, Any]]:
    """Fallback si les RPC Postgres ne sont pas encore créées."""
    if reminder_type == "rappel_h18":
        # RDV programmés dans ~18h, jamais notifiés H-18, consentement OK.
        # Tranche horaire = créneau courant +17h30 -> +18h30 (cron horaire).
        return _select_appointments(
            extra_filter=(
                "rappel_h18.eq.false,status.eq.scheduled,retry_count.lt.3"
            ),
        )
    if reminder_type == "rappel_h2":
        return _select_appointments(
            extra_filter=(
                "rappel_h2.eq.false,status.in.(scheduled,confirmed),retry_count.lt.3"
            ),
        )
    if reminder_type == "post_consultation":
        return _select_appointments(
            extra_filter=(
                "post_consultation_sent.eq.false,status.eq.completed,retry_count.lt.3"
            ),
        )
    return []


def _select_appointments(extra_filter: str) -> list[dict[str, Any]]:
    """Helper PostgREST minimal — la logique temporelle reste dans les RPC."""
    query = (
        supabase.table("appointments")
        .select(
            "id, date_time, doctor_id, patient_id, duration_min,"
            " conversation_opened_at, retry_count,"
            " patients(name, phone, language_pref, consent_whatsapp),"
            " doctors(name)"
        )
    )
    for clause in extra_filter.split(","):
        col, op, value = clause.split(".", 2)
        query = query.filter(col, op, value)
    return query.execute().data or []


def _has_active_consent(patient_id: str) -> bool:
    """Vérification belt-and-suspenders dans patient_consents."""
    try:
        resp = (
            supabase.table("patient_consents")
            .select("id")
            .eq("patient_id", patient_id)
            .eq("consent_type", "whatsapp_reminder")
            .is_("revoked_at", "null")
            .limit(1)
            .execute()
        )
        return bool(resp.data)
    except Exception as exc:  # pragma: no cover
        log.warning("Lecture patient_consents échouée (patient_id=%s) : %s", patient_id, exc)
        return False


# ---------------------------------------------------------------------------
# 2. Génération audio (edge-tts + ffmpeg) + upload Supabase Storage
# ---------------------------------------------------------------------------


def generate_audio(text: str, language: str, appointment_id: str) -> str:
    """Génère un fichier audio OGG/Opus et l'upload sur Supabase Storage.

    Retourne l'URL publique signée (24h) du fichier.
    """
    voice = VOICES.get(language, VOICES["darija"])

    with tempfile.TemporaryDirectory() as tmpdir:
        mp3_path = Path(tmpdir) / "out.mp3"
        ogg_path = Path(tmpdir) / "out.ogg"

        # 1. edge-tts -> MP3
        asyncio.run(_edge_tts_to_file(text, voice, str(mp3_path)))

        # 2. ffmpeg MP3 -> OGG/Opus 24kbps mono (format WhatsApp note vocale)
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(mp3_path),
                "-c:a", "libopus", "-b:a", "24k", "-ac", "1",
                str(ogg_path),
            ],
            check=True,
            capture_output=True,
        )

        # 3. Upload Supabase Storage
        object_name = f"{appointment_id}_{uuid.uuid4().hex[:8]}.ogg"
        with ogg_path.open("rb") as f:
            supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
                path=object_name,
                file=f,
                file_options={"content-type": "audio/ogg", "upsert": "true"},
            )

        # 4. URL signée 24h
        signed = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).create_signed_url(
            path=object_name,
            expires_in=86_400,
        )
        return signed["signedURL"]


async def _edge_tts_to_file(text: str, voice: str, output_path: str) -> None:
    """Wrapper async pour edge-tts."""
    communicate = edge_tts.Communicate(text=text, voice=voice)
    await communicate.save(output_path)


# ---------------------------------------------------------------------------
# 3. Envoi WhatsApp via WhatChimp
# ---------------------------------------------------------------------------


def send_whatsapp(
    phone: str,
    text: str,
    audio_url: str | None = None,
    template_name: str | None = None,
    template_params: list[str] | None = None,
) -> dict[str, Any]:
    """Envoie un message via WhatChimp.

    - Si `template_name` est défini : envoi en mode template (payant Meta,
      utilisé pour le H-18 qui ouvre la fenêtre 24h).
    - Sinon : envoi en session message (gratuit dans la fenêtre 24h).
    """
    headers = {
        "Authorization": f"Bearer {WHATCHIMP_API_KEY}",
        "Content-Type": "application/json",
    }

    if template_name:
        payload = {
            "phone_number_id": WHATCHIMP_PHONE_ID,
            "to": phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": "fr",
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {"type": "text", "text": p} for p in (template_params or [])
                        ],
                    }
                ],
            },
        }
    else:
        payload = {
            "phone_number_id": WHATCHIMP_PHONE_ID,
            "to": phone,
            "type": "text",
            "text": {"body": text},
        }

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"{WHATCHIMP_BASE_URL}/messages",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        text_msg_id = resp.json().get("message_id")

        # Si on a un audio, on l'envoie en second message (note vocale)
        audio_msg_id = None
        if audio_url:
            audio_payload = {
                "phone_number_id": WHATCHIMP_PHONE_ID,
                "to": phone,
                "type": "audio",
                "audio": {"link": audio_url, "voice": True},
            }
            audio_resp = client.post(
                f"{WHATCHIMP_BASE_URL}/messages",
                headers=headers,
                json=audio_payload,
            )
            audio_resp.raise_for_status()
            audio_msg_id = audio_resp.json().get("message_id")

    return {
        "message_id": audio_msg_id or text_msg_id,
        "text_message_id": text_msg_id,
        "audio_message_id": audio_msg_id,
    }


# ---------------------------------------------------------------------------
# 4. Marquage Supabase + log d'observabilité
# ---------------------------------------------------------------------------


def mark_sent(
    appointment_id: str,
    reminder_type: str,
    result: ReminderResult,
    open_conversation: bool = False,
) -> None:
    """Met à jour les flags du RDV et écrit dans reminder_logs."""

    # 1. Update appointments
    update_payload: dict[str, Any] = {}
    if result.status == "success":
        if reminder_type == "rappel_h18":
            update_payload["rappel_h18"] = True
        elif reminder_type == "rappel_h2":
            update_payload["rappel_h2"] = True
        elif reminder_type == "post_consultation":
            update_payload["post_consultation_sent"] = True
        if open_conversation:
            update_payload["conversation_opened_at"] = "now()"
        # Reset retry compteur sur succès
        update_payload["retry_count"] = 0
        update_payload["last_error"] = None
    elif result.status == "error":
        # increment retry_count via RPC pour éviter race condition
        try:
            supabase.rpc(
                "increment_retry_count",
                {"appointment_id": appointment_id, "error_msg": result.error_message or ""},
            ).execute()
        except Exception:
            # Fallback : update direct
            current = (
                supabase.table("appointments")
                .select("retry_count")
                .eq("id", appointment_id)
                .single()
                .execute()
            )
            update_payload["retry_count"] = (current.data.get("retry_count", 0) or 0) + 1
            update_payload["last_error"] = (result.error_message or "")[:500]

    if update_payload:
        supabase.table("appointments").update(update_payload).eq("id", appointment_id).execute()

    # 2. Insert reminder_logs (toujours, pour audit)
    supabase.table("reminder_logs").insert(
        {
            "appointment_id": appointment_id,
            "reminder_type": reminder_type,
            "status": result.status,
            "whatchimp_message_id": result.whatchimp_message_id,
            "audio_url": result.audio_url,
            "error_message": result.error_message,
            "duration_ms": result.duration_ms,
        }
    ).execute()


# ---------------------------------------------------------------------------
# Composition des messages par cas
# ---------------------------------------------------------------------------


def _format_h18(appt: dict[str, Any]) -> tuple[str, list[str]]:
    """Texte FR du template appointment_reminder + paramètres."""
    patient_name = appt["patients"]["name"]
    doctor_name = appt["doctors"]["name"]
    heure = appt["date_time"][11:16]  # HH:MM
    text = (
        f"Bonjour {patient_name}, rappel : votre rendez-vous est demain à {heure} "
        f"avec Dr {doctor_name}. Répondez 1 pour confirmer, 2 pour reporter."
    )
    return text, [patient_name, heure, doctor_name]


def _format_h2(appt: dict[str, Any]) -> str:
    patient_name = appt["patients"]["name"]
    heure = appt["date_time"][11:16]
    return (
        f"Bonjour {patient_name}, votre rendez-vous est dans 2 heures (à {heure}). "
        f"À tout à l'heure !"
    )


def _format_post(appt: dict[str, Any]) -> str:
    patient_name = appt["patients"]["name"]
    return (
        f"Bonjour {patient_name}, merci de votre visite. "
        f"N'hésitez pas à nous contacter si vous avez la moindre question."
    )


# ---------------------------------------------------------------------------
# Boucle principale par type de rappel
# ---------------------------------------------------------------------------


def _process_reminder(
    appt: dict[str, Any],
    reminder_type: str,
) -> ReminderResult:
    """Traite un seul RDV. Toutes les exceptions sont capturées par l'appelant."""
    appointment_id = appt["id"]
    patient = appt["patients"]
    started = time.monotonic()

    # Garde CNDP : double vérification consentement
    if not patient.get("consent_whatsapp"):
        return ReminderResult(appointment_id, reminder_type, "skipped_no_consent")
    if not _has_active_consent(appt["patient_id"]):
        return ReminderResult(appointment_id, reminder_type, "skipped_no_consent")

    language = patient.get("language_pref") or "darija"

    # Composition message
    if reminder_type == "rappel_h18":
        text, params = _format_h18(appt)
        audio_url = generate_audio(text, language, appointment_id)
        wa_resp = send_whatsapp(
            phone=patient["phone"],
            text=text,
            audio_url=audio_url,
            template_name="appointment_reminder",
            template_params=params,
        )
        return ReminderResult(
            appointment_id=appointment_id,
            reminder_type=reminder_type,
            status="success",
            whatchimp_message_id=wa_resp.get("message_id"),
            audio_url=audio_url,
            duration_ms=int((time.monotonic() - started) * 1000),
        )

    if reminder_type == "rappel_h2":
        # Garde anti-dedup : la fenêtre 24h doit être ouverte
        if not appt.get("conversation_opened_at"):
            return ReminderResult(appointment_id, reminder_type, "skipped_dedup")
        text = _format_h2(appt)
        audio_url = generate_audio(text, language, appointment_id)
        wa_resp = send_whatsapp(
            phone=patient["phone"],
            text=text,
            audio_url=audio_url,
        )
        return ReminderResult(
            appointment_id=appointment_id,
            reminder_type=reminder_type,
            status="success",
            whatchimp_message_id=wa_resp.get("message_id"),
            audio_url=audio_url,
            duration_ms=int((time.monotonic() - started) * 1000),
        )

    if reminder_type == "post_consultation":
        if not appt.get("conversation_opened_at"):
            return ReminderResult(appointment_id, reminder_type, "skipped_dedup")
        text = _format_post(appt)
        audio_url = generate_audio(text, language, appointment_id)
        wa_resp = send_whatsapp(
            phone=patient["phone"],
            text=text,
            audio_url=audio_url,
        )
        return ReminderResult(
            appointment_id=appointment_id,
            reminder_type=reminder_type,
            status="success",
            whatchimp_message_id=wa_resp.get("message_id"),
            audio_url=audio_url,
            duration_ms=int((time.monotonic() - started) * 1000),
        )

    raise ValueError(f"reminder_type inconnu : {reminder_type}")


def _run_batch(reminder_type: str) -> None:
    """Traite tous les RDV éligibles d'un type, un par un, isolés en try/except."""
    appointments = get_pending_reminders(reminder_type)
    log.info("[%s] %d RDV éligibles", reminder_type, len(appointments))

    for appt in appointments:
        appointment_id = appt["id"]
        try:
            result = _process_reminder(appt, reminder_type)
            mark_sent(
                appointment_id,
                reminder_type,
                result,
                open_conversation=(reminder_type == "rappel_h18" and result.status == "success"),
            )
            log.info("[%s] %s -> %s", reminder_type, appointment_id, result.status)
        except Exception as exc:
            err = repr(exc)[:500]
            log.error("[%s] %s ÉCHEC : %s", reminder_type, appointment_id, err)
            mark_sent(
                appointment_id,
                reminder_type,
                ReminderResult(
                    appointment_id=appointment_id,
                    reminder_type=reminder_type,
                    status="error",
                    error_message=err,
                ),
            )


def main() -> None:
    log.info("=== reminder_worker démarré ===")
    _run_batch("rappel_h18")
    _run_batch("rappel_h2")
    _run_batch("post_consultation")

    # ------------------------------------------------------------------
    # Cas futurs (à activer dans la brique billing) :
    # ------------------------------------------------------------------
    # _run_batch("relance_j3")
    # _run_batch("relance_j7")

    log.info("=== reminder_worker terminé ===")


if __name__ == "__main__":
    main()
