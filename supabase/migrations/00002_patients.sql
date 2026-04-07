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
