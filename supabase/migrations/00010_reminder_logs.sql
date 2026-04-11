-- Migration 00010 — reminder_logs
-- Table d'observabilité alimentée par scripts/reminder_worker.py.
-- Une ligne par tentative d'envoi (success / error / skipped_*).

CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);
