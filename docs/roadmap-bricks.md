# Roadmap briques — Medegenii

Chaque brique ajoute une fonctionnalité sans casser les précédentes.
Base constante : Next.js dashboard + Supabase + n8n + WhatsApp.
Architecture modulaire : chaque brique = un module dans /src/modules/.

## Brick 0 — Anti no-show (Jour 1-2) ACTIF

Création RDV dans le dashboard → 2 rappels WhatsApp automatiques (J-1 à 20h, J-0 à H-2).
Patient confirme (1) ou reporte (2) par WhatsApp.
Taux de confirmation visible en temps réel sur le dashboard.

Module : `/src/modules/appointments/`
Workflow n8n : rappel-rdv-j1, rappel-rdv-j0, reponse-patient
Tables : doctors, patients, appointments
Coût additionnel : ~$0 (service messages gratuits si patient initie, sinon ~$0.026/msg)

## Brick 1 — Relance paiement (Semaine 2) ACTIF

Champs montant (amount_mad) et statut (payment_status) sur les RDV.
Dashboard : rouge = impayé, vert = payé.
Relances WhatsApp automatiques à J+3 et J+7 (max 2 relances).

Module : `/src/modules/billing/`
Workflow n8n : relance-paiement
Colonnes ajoutées : amount_mad, payment_status, payment_date, relance_count, last_relance_at
Coût additionnel : $0

## Brick 2 — Transcription vocale (Semaines 3-4) — Phase 2

Médecin enregistre la consultation dans l'app (MediaRecorder API).
Audio → Supabase Storage → n8n → Groq Whisper → texte éditable dans le dashboard.

Module : `/src/modules/transcription/`
Workflow n8n : transcription
Table : consultations (audio_url, transcript)
Coût : ~$7/mois (Groq Whisper API)

## Brick 3 — Résumé structuré IA (Semaines 4-5) — Phase 2

Transcript validé → Gemini Flash-Lite → JSON structuré (motif, examen, diagnostic, traitement, suivi).
Médecin valide le résumé avant envoi.

Module : `/src/modules/summary/`
Workflow n8n : resume-structure
Colonne ajoutée : consultations.summary_json
Coût : ~$2/mois (Gemini Flash-Lite API)

## Brick 4 — Message vocal patient (Semaines 5-6) — Phase 3

Résumé validé → script patient (FR/Darija) → Gemini TTS → .ogg → WhatsApp vocal.
Le patient écoute les instructions post-consultation en vocal.

Module : `/src/modules/vocal/`
Workflow n8n : vocal-patient
Table : messages (consultation_id, patient_id, channel, type, sent_at, played_at)
Coût : ~$25/mois (Gemini TTS API)

## Brick 5 — Vérification interactions médicamenteuses (Mois 2-3) — Phase 3

Appel API DrugBank en parallèle lors du résumé.
Alerte rouge dans le dashboard si conflit entre médicaments prescrits.

Module : `/src/modules/drug-check/`
Workflow n8n : drug-interaction-check
Table : drug_interactions (consultation_id, drug_a, drug_b, severity, description)
Coût : ~$50/mois (DrugBank API)

## Brick 6 — Formulaires CNSS/CNOPS (Mois 3) — Phase 3

À partir du JSON summary (codes CIM-10, actes NGAP, médicaments) :
Gemini génère un PDF pré-rempli pour le remboursement mutualiste.

Module : `/src/modules/forms/`
Workflow n8n : generate-cnss-form
Coût : $0 (utilise Gemini Flash-Lite déjà payé)

## Brick 7 — Dossier patient intelligent (Mois 4-5) — Phase 4

Tous les résumés vectorisés avec Gemini Embedding, stockés dans pgvector (Supabase).
Requêtes en langage naturel : "Quand est-ce que ce patient a eu de l'hypertension ?"

Module : `/src/modules/patient-history/`
Migration : ADD COLUMN embedding vector(768) sur consultations
Coût : ~$2/mois (Gemini Embedding API)

## Brick 8 — Copilote diagnostic + imagerie (Mois 6+) — Phase 4

Suggestions diagnostiques basées sur les symptômes et l'historique vectorisé.
Analyse d'images médicales (dermato, radio) via MedGemma 1.5.

Module : `/src/modules/imaging/`
Table : imaging_results (consultation_id, image_url, analysis_json, model_used)
Coût : $5-50/mois selon volume

## Pricing cumulatif pour le médecin (MAD/mois)

| Briques incluses | Prix | Proposition de valeur |
|-----------------|------|----------------------|
| 0 (rappels seuls) | 300 | Réduit le no-show de 30-50% |
| 0+1 (+ paiements) | 500 | Récupère les impayés |
| 0-3 (+ transcription + résumé) | 700 | Gagne ~1h/jour en admin |
| 0-4 (+ vocal patient) | 900 | Patient recommande le médecin |
| 0-7 (tout sauf copilote) | 1100 | Le cabinet tourne quasi-seul |
| 0-8 (copilote IA complet) | 1200 | Assistant IA intégré |

## Coût infra mensuel

| Phase | Coût approx. | Seuil de rentabilité |
|-------|-------------|---------------------|
| Phase 1 (bricks 0-1) | ~$30-50 | 2 médecins à 500 MAD |
| Phase 2 (bricks 0-3) | ~$60-80 | 3 médecins à 700 MAD |
| Phase 3 (bricks 0-6) | ~$120-150 | 5 médecins à 900 MAD |
| Phase 4 (bricks 0-8) | ~$150-200 | 6 médecins à 1200 MAD |
