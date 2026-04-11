# Roadmap briques — Medegenii

Chaque brique ajoute une fonctionnalité sans casser les précédentes.
Base constante : Next.js dashboard + Supabase + script Python + WhatsApp (WhatChimp).
Architecture modulaire : chaque brique = un module dans /src/modules/.

## Brick 0 — Anti no-show WhatsApp texte + audio (EN COURS) ACTIF

Création RDV dans le dashboard → 3 messages WhatsApp automatiques dans la fenêtre 24h Meta :
- **H-18** : template texte + audio darija (ouvre la fenêtre)
- **H-2** : texte court (gratuit, dans la fenêtre)
- **Post-consultation** : satisfaction + conseil santé (gratuit, dans la fenêtre)

Patient confirme (1) ou reporte (2) par WhatsApp.
Taux de confirmation visible en temps réel sur le dashboard.

Module : `/src/modules/appointments/`
Worker : `scripts/reminder_worker.py` (cron horaire sur 91.106.102.37)
Tables : doctors, patients, appointments, voice_templates, reminder_logs
Coût additionnel : ~0,26 MAD/RDV (1 template Meta) — utility gratuit dans la fenêtre

## Brick 1 — FSE CNSS pré-remplie (PROCHAIN) Phase 2

À partir des données du RDV (codes CIM-10, actes NGAP, médicaments) :
génération d'un PDF pré-rempli pour la feuille de soins CNSS (formulaire 610-1-02).
Saisie des actes avec codes NGAP et tarifs CNSS intégrés.

Module : `/src/modules/cnss-fse/`
Tables ajoutées : consultations, consultation_acts, reference_acts
Coût additionnel : $0 (génération PDF locale)

## Brick 2 — Intégration API CNSS (EN ATTENTE SANDBOX) Phase 3

Remplacement du PDF par la télétransmission directe via l'API CNSS Netopia.
Candidature en cours auprès de fse@cnss.ma pour accès sandbox + homologation.

Module : `/src/modules/cnss-api/`
Coût additionnel : $0 (API CNSS gratuite après homologation)

## Brick 3 — Transcription vocale (Phase 4)

Médecin enregistre la consultation dans l'app (MediaRecorder API).
Audio → Supabase Storage → worker → Groq Whisper → texte éditable dans le dashboard.

Module : `/src/modules/transcription/`
Table : consultations.transcript
Coût : ~$7/mois (Groq Whisper API)

## Brick 4 — Résumé structuré IA (Phase 4)

Transcript validé → Gemini Flash-Lite → JSON structuré (motif, examen, diagnostic, traitement, suivi).
Médecin valide le résumé avant envoi.

Module : `/src/modules/summary/`
Colonne ajoutée : consultations.summary_json
Coût : ~$2/mois (Gemini Flash-Lite API)

## Brick 5 — Relance impayés automatique (Phase future)

Champs montant (amount_mad) et statut (payment_status) sur les RDV.
Dashboard : violet = impayé, bleu = payé.
Relances WhatsApp automatiques à J+3 et J+7 (max 2 relances) via le même `reminder_worker.py`.

Module : `/src/modules/billing/` (existe déjà côté UI, worker à activer)
Worker : ajout de `get_unpaid_j3()` et `get_unpaid_j7()` dans `reminder_worker.py`
Colonnes existantes : amount_mad, payment_status, payment_date, relance_count, last_relance_at
Coût additionnel : ~0,26 MAD par relance (template Meta)

## Brick 6 — Chatbot patient WhatsApp (Phase future)

Webhook entrant WhatChimp → réponses automatiques (confirmation/annulation/info pratique).
Statut RDV mis à jour automatiquement via le worker.

Module : `/src/modules/chatbot/`
Coût : $0 (utility gratuit dans la fenêtre)

## Brick 7 — Vérification interactions médicamenteuses (Phase 5)

Appel API DrugBank en parallèle lors du résumé.
Alerte rouge dans le dashboard si conflit entre médicaments prescrits.

Module : `/src/modules/drug-check/`
Table : drug_interactions
Coût : ~$50/mois (DrugBank API)

## Brick 8 — Dossier patient intelligent (Phase 6)

Tous les résumés vectorisés avec Gemini Embedding, stockés dans pgvector (Supabase).
Requêtes en langage naturel : "Quand est-ce que ce patient a eu de l'hypertension ?"

Module : `/src/modules/patient-history/`
Migration : ADD COLUMN embedding vector(768) sur consultations
Coût : ~$2/mois (Gemini Embedding API)

## Brick 9 — Copilote diagnostic + imagerie (Phase 6)

Suggestions diagnostiques basées sur les symptômes et l'historique vectorisé.
Analyse d'images médicales (dermato, radio) via MedGemma 1.5.

Module : `/src/modules/imaging/`
Table : imaging_results
Coût : $5-50/mois selon volume

---

## Pricing — Offres commerciales

### Essentiel — 399 MAD/mois par médecin ✅ ACTIVE

- Rappels WhatsApp texte + audio darija (3 messages dans la fenêtre 24h)
  - H-18 : template texte + audio (ouvre la fenêtre Meta)
  - H-2 : texte court (gratuit dans la fenêtre)
  - Post-consultation : satisfaction / conseil santé (gratuit dans la fenêtre)
- Gestion rendez-vous & patients
- Dashboard taux de no-show
- Cap : 500 patients actifs / mois
- 1 médecin + 1 secrétaire par abonnement

### Pro — 799 MAD/mois par médecin 🔜 BIENTÔT

- Tout Essentiel +
- FSE CNSS pré-remplie (PDF puis télétransmission API)
- Codes actes NGAP avec tarifs CNSS intégrés
- Statistiques avancées (revenus, remboursements, actes)
- Cap : 1 500 patients actifs / mois

### Clinique — Sur devis 🔜 BIENTÔT

- Tout Pro +
- Multi-praticiens illimités
- Dashboard consolidé
- Reporting par spécialité
- Support prioritaire

---

## Coûts mensuels (pour 20 médecins, ~500 patients/médecin)

| Poste | Coût |
|---|---|
| WhatChimp (BSP Meta, mutualisé) | 120 MAD ($12) |
| Conversations Meta (~10 000 conv, fenêtre 24h optimisée) | ~3 000 MAD |
| Vercel (hosting Next.js) | 0 MAD (tier gratuit) |
| Supabase (DB + Storage) | 0 MAD (tier gratuit) |
| Serveur 91.106.102.37 (cron + scripts) | déjà payé |
| edge-tts + ffmpeg | 0 MAD |
| **Total** | **~3 120 MAD/mois** |
| **Revenu (20 × 399 MAD)** | **7 980 MAD/mois** |
| **Marge brute** | **~4 860 MAD/mois (61%)** |
