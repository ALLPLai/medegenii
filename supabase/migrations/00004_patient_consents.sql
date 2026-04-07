CREATE TABLE patient_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL
    CHECK (consent_type IN ('whatsapp_reminder','whatsapp_vocal','data_processing','transcription')),
  consented_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  revoked_at TIMESTAMPTZ
);

ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consents_own_doctor" ON patient_consents
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX idx_consents_patient ON patient_consents(patient_id);
CREATE INDEX idx_consents_type ON patient_consents(consent_type);
