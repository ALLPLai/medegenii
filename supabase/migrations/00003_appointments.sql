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
