# Workflows WhatsApp — Medegenii

> Toute la brique rappel/vocal patient est orchestrée par un **script Python unique**
> (`scripts/reminder_worker.py`) exécuté par cron toutes les heures sur le serveur dédié
> `91.106.102.37`. Aucun service tiers (Make, n8n, Zapier) — full contrôle, zéro abonnement SaaS.

## Architecture en une image

```
┌──────────────────────┐    ┌────────────────────────┐
│  cron (0 * * * *)    │───▶│  reminder_worker.py    │
└──────────────────────┘    └─────────┬──────────────┘
                                      │
              ┌───────────────────────┼─────────────────────────┐
              ▼                       ▼                         ▼
   ┌──────────────────┐   ┌────────────────────┐    ┌─────────────────────┐
   │ Supabase Postgres│   │ edge-tts + ffmpeg  │    │ Supabase Storage    │
   │ (RDV éligibles)  │   │ (audio darija/fr)  │    │ (audio-reminders/)  │
   └──────────────────┘   └─────────┬──────────┘    └──────────┬──────────┘
                                    │                          │
                                    └───────────┬──────────────┘
                                                ▼
                                    ┌──────────────────────┐
                                    │ WhatChimp API (BSP)  │
                                    │ → Patient WhatsApp   │
                                    └──────────────────────┘
```

L'app Next.js n'interagit PAS directement avec le worker — elle écrit/lit les RDV
dans Supabase, le worker prend le relais.

## Variables d'environnement requises

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=service_role_key   # service_role : RLS bypass nécessaire
WHATCHIMP_API_KEY=xxxx
WHATCHIMP_PHONE_ID=xxxx
SUPABASE_STORAGE_BUCKET=audio-reminders
```

## Les 4 fonctions principales

```python
def get_pending_reminders(reminder_type: str) -> list[dict]: ...
def generate_audio(text: str, language: str) -> str: ...   # retourne l'URL Supabase Storage
def send_whatsapp(phone: str, text: str, audio_url: str | None) -> dict: ...
def mark_sent(appointment_id: str, reminder_type: str, log: dict) -> None: ...
```

## Cas 1 — Rappel H-18 (template, ouvre la fenêtre 24h)

**Quand** : RDV programmé entre 17h et 19h dans 18 heures (cron horaire,
le worker récupère donc la tranche du créneau courant +18h ±30 min).

**Pourquoi un template** : c'est le PREMIER message envoyé au patient pour ce RDV.
Hors fenêtre 24h Meta → conversation marketing/utility template payante (~$0.026,
classé Rest of Africa). Une fois envoyé, la fenêtre 24h s'ouvre et tous les
messages suivants (H-2, post-consultation) sont **gratuits**.

**Requête SQL** (via supabase-py) :

```sql
SELECT a.id, a.date_time, a.doctor_id,
       p.id AS patient_id, p.name, p.phone, p.language_pref, p.consent_whatsapp,
       d.name AS doctor_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.date_time BETWEEN now() + interval '17 hours 30 minutes'
                      AND now() + interval '18 hours 30 minutes'
  AND a.rappel_h18 = false
  AND a.status = 'scheduled'
  AND a.retry_count < 3
  AND p.consent_whatsapp = true
```

**Pipeline** :

1. Pour chaque RDV → composer le texte FR (template `appointment_reminder`)
2. Générer un audio darija/fr avec edge-tts (`ar-MA-MounaNeural` ou `fr-FR-DeniseNeural`)
3. Convertir en OGG/Opus (`ffmpeg -i audio.mp3 -c:a libopus -b:a 24k audio.ogg`)
4. Upload sur `audio-reminders/{appointment_id}_h18.ogg` → URL signée 24h
5. `send_whatsapp(phone, text, audio_url)` via WhatChimp (mode template)
6. Marquer `rappel_h18 = true`, `conversation_opened_at = now()`
7. Insérer ligne dans `reminder_logs` (status `success`)

**Texte template** (à faire approuver par Meta) :

```
Bonjour {{1}}, rappel : votre rendez-vous est demain à {{2}} avec Dr {{3}}.
Répondez 1 pour confirmer, 2 pour reporter.
```

## Cas 2 — Rappel H-2 (utility gratuit dans la fenêtre 24h)

**Quand** : RDV dans 2 heures (cron horaire, tranche +1h30 → +2h30).

**Condition** : `conversation_opened_at` est posé (sinon le H-18 a échoué et il
faut envoyer un template, donc on skip et on logge `skipped_dedup`).

**Requête SQL** :

```sql
SELECT a.id, a.date_time, p.name, p.phone, p.language_pref, p.consent_whatsapp,
       d.name AS doctor_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.date_time BETWEEN now() + interval '1 hour 30 minutes'
                      AND now() + interval '2 hours 30 minutes'
  AND a.rappel_h2 = false
  AND a.conversation_opened_at IS NOT NULL
  AND a.conversation_opened_at > now() - interval '24 hours'
  AND a.status IN ('scheduled', 'confirmed')
  AND a.retry_count < 3
  AND p.consent_whatsapp = true
```

**Pipeline** : texte court + audio darija court → WhatChimp en **session message**
(pas de template, gratuit) → marquer `rappel_h2 = true`.

## Cas 3 — Post-consultation (utility gratuit dans la fenêtre 24h)

**Quand** : 2h après la fin d'un RDV `completed` (cron horaire).

**Requête SQL** :

```sql
SELECT a.id, p.name, p.phone, p.language_pref, p.consent_whatsapp
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.status = 'completed'
  AND a.post_consultation_sent = false
  AND a.conversation_opened_at IS NOT NULL
  AND a.conversation_opened_at > now() - interval '24 hours'
  AND (a.date_time + (a.duration_min || ' minutes')::interval) < now() - interval '2 hours'
  AND a.retry_count < 3
  AND p.consent_whatsapp = true
```

**Pipeline** : message satisfaction + audio "conseil santé du jour" piochés dans
`voice_templates` (type=`post_consultation`, language=patient.language_pref).

## Cas futurs (commentés dans le worker, à activer plus tard)

### Cas 4 — Relance impayés J+3 (brique séparée)

```python
# def get_unpaid_j3() -> list[dict]:
#     """RDV completed/no_show avec amount_mad > 0 et payment_status='pending' depuis 3 jours."""
#     pass
```

### Cas 5 — Relance impayés J+7 (dernière relance)

```python
# def get_unpaid_j7() -> list[dict]:
#     """Idem mais 7 jours, relance_count < 2."""
#     pass
```

Ces deux cas seront ajoutés dans une 2e itération de la brique billing — leur
table de log sera la même (`reminder_logs`), juste avec des `reminder_type`
spécifiques.

## Résilience et retry

Le worker entoure CHAQUE RDV d'un `try/except` indépendant : un échec sur un RDV
ne bloque jamais les autres.

- En cas d'exception (edge-tts down, ffmpeg crash, WhatChimp 5xx, upload Storage
  KO) : `retry_count = retry_count + 1`, `last_error = repr(exc)[:500]`.
- À `retry_count >= 3` le RDV est exclu de la prochaine fenêtre (filtre SQL).
- Tous les essais (succès, erreur, skip) écrivent dans `reminder_logs` pour
  l'audit et l'observabilité.

## Vérification consentement (CNDP)

Avant chaque envoi le worker vérifie deux choses :

1. `patients.consent_whatsapp = true` (filtre SQL, hard gate)
2. Une ligne active dans `patient_consents` pour `consent_type='whatsapp_reminder'`
   et `revoked_at IS NULL` (vérification belt-and-suspenders)

Si l'une des deux échoue → log `status='skipped_no_consent'`, le rappel n'est
pas envoyé, le flag `rappel_h18` reste à false (le patient peut redonner
consentement plus tard).

## Optimisation fenêtre 24h Meta

C'est LE levier de coût de la brique. Stratégie :

- 1 seul template payant par RDV (le H-18) → ouvre la fenêtre
- 2 messages utility gratuits dans les 24h qui suivent (H-2 + post-consultation)
- Coût marginal par RDV : ~$0.026 (≈ 0,26 MAD)

Pour 500 RDV/médecin/mois : ~130 MAD de templates Meta + 120 MAD WhatChimp
mutualisés = ~250 MAD de coût brique pour un médecin payant 399 MAD. **Marge
brute ≈ 37%** dès le premier client, avant amortissement infra.

## Templates WhatsApp à créer dans Meta Business

| Nom | Catégorie | Variables | Corps |
|-----|-----------|-----------|-------|
| `appointment_reminder` | Utility | {{1}} patient {{2}} heure {{3}} médecin | "Bonjour {{1}}, rappel : votre rendez-vous est demain à {{2}} avec Dr {{3}}. Répondez 1 pour confirmer, 2 pour reporter." |

> Les autres rappels (H-2, post-consultation) sont des **session messages**
> gratuits dans la fenêtre — pas de template à créer, on envoie du texte libre
> via WhatChimp.

## Lancement et monitoring

```bash
# Installation sur 91.106.102.37
cd /opt/medegenii
git clone <repo> .
python3 -m venv venv && source venv/bin/activate
pip install -r scripts/requirements.txt
cp scripts/.env.example scripts/.env  # remplir les valeurs
apt install ffmpeg -y

# Cron (toutes les heures à HH:00)
crontab -e
0 * * * * cd /opt/medegenii && /opt/medegenii/venv/bin/python scripts/reminder_worker.py >> /var/log/medegenii-reminders.log 2>&1
```

Monitoring :

- `journalctl -u cron -f` (exécutions cron)
- `tail -f /var/log/medegenii-reminders.log` (stdout du worker)
- Dashboard Supabase → table `reminder_logs` : filtrer par `status='error'` sur
  les dernières 24h pour repérer les médecins en panne
