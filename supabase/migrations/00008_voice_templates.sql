-- Migration 00008 — voice_templates
-- Table des modèles audio réutilisables générés via edge-tts
-- (intros, outros, conseils santé, rappels génériques).
-- Utilisée par scripts/reminder_worker.py pour composer les rappels WhatsApp.

CREATE TABLE IF NOT EXISTS voice_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('fr', 'ar', 'darija', 'amazigh')),
  audio_url TEXT NOT NULL,
  text_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_templates_type_lang ON voice_templates(type, language);
