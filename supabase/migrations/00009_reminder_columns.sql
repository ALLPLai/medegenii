-- Migration 00009 — colonnes rappels WhatsApp
-- Ajoute les champs consommés par scripts/reminder_worker.py :
--   - patients.language_pref / consent_whatsapp
--   - appointments.rappel_h18 / rappel_h2 / post_consultation_sent
--   - appointments.conversation_opened_at (optimisation fenêtre 24h Meta)
--   - appointments.retry_count / last_error (résilience worker, max 3)

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS language_pref TEXT DEFAULT 'fr'
  CHECK (language_pref IN ('fr', 'ar', 'darija', 'amazigh'));

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS consent_whatsapp BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS rappel_h18 BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS rappel_h2 BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS post_consultation_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS conversation_opened_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS last_error TEXT DEFAULT NULL;
