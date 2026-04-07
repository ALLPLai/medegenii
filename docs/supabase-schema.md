# Schéma Supabase — Medegenii

Toutes les migrations dans `supabase/migrations/`.
IMPORTANT : ne jamais modifier une migration existante. Toujours en créer une nouvelle.
Région obligatoire : eu-west-1 (Dublin) ou eu-central-1 (Frankfurt).

## Migration 00001 — doctors

```sql
CREATE TABLE doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT DEFAULT 'generaliste',
  city TEXT,
  subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','past_due','cancelled')),
  subscription_provider TEXT DEFAULT 'manual'
    CHECK (subscription_provider IN ('manual','polar','dodo','payzone')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_own_data" ON doctors
  FOR ALL USING (auth.uid() = id);
```

## Migration 00002 — patients

```sql
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  language_pref TEXT DEFAULT 'fr'
    CHECK (language_pref IN ('fr','ar','darija')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_own_doctor" ON patients
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX idx_patients_doctor ON patients(doctor_id);
CREATE INDEX idx_patients_phone ON patients(phone);
```

## Migration 00003 — appointments

```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  duration_min INT DEFAULT 20,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','confirmed','cancelled','completed','no_show')),
  reminder_j1_sent BOOLEAN DEFAULT false,
  reminder_j0_sent BOOLEAN DEFAULT false,
  patient_response TEXT
    CHECK (patient_response IN (NULL,'confirmed','reschedule','cancelled')),
  amount_mad NUMERIC(10,2),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','partial','overdue')),
  payment_date TIMESTAMPTZ,
  relance_count INT DEFAULT 0,
  last_relance_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_own_doctor" ON appointments
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_payment ON appointments(payment_status);
```

## Migration 00004 — patient_consents

Voir docs/compliance-cndp.md pour le SQL complet.

## Migration 00005 — audit_log

Voir docs/compliance-cndp.md pour le SQL complet.

## Migrations futures (NE PAS CRÉER MAINTENANT)

Ces migrations seront créées quand la brique correspondante sera activée :

### 00006 — consultations (Brick 2-3)

```sql
-- NE PAS EXÉCUTER — référence future uniquement
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  audio_url TEXT,
  transcript TEXT,
  summary_json JSONB,
  vocal_url TEXT,
  status TEXT DEFAULT 'recording'
    CHECK (status IN ('recording','transcribing','summarizing','validated','sent')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consultations_own_doctor" ON consultations
  FOR ALL USING (doctor_id = auth.uid());
```

### 00007 — messages (Brick 4)

```sql
-- NE PAS EXÉCUTER — référence future uniquement
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  channel TEXT DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp','sms','email')),
  type TEXT DEFAULT 'vocal'
    CHECK (type IN ('vocal','text','reminder','relance')),
  content_url TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  played_at TIMESTAMPTZ
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_own_doctor" ON messages
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE doctor_id = auth.uid())
  );
```

### 00008 — drug_interactions (Brick 5)

```sql
-- NE PAS EXÉCUTER — référence future uniquement
CREATE TABLE drug_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low','moderate','high','critical')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 00009 — embeddings (Brick 7)

```sql
-- NE PAS EXÉCUTER — référence future uniquement
-- Requiert : CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE consultations ADD COLUMN embedding vector(768);
ALTER TABLE consultations ADD COLUMN content_hash TEXT;
CREATE INDEX idx_consultations_embedding ON consultations
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 00010 — imaging_results (Brick 8)

```sql
-- NE PAS EXÉCUTER — référence future uniquement
CREATE TABLE imaging_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  analysis_json JSONB,
  model_used TEXT DEFAULT 'medgemma-1.5',
  created_at TIMESTAMPTZ DEFAULT now()
);
```
