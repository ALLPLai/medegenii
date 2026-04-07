CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_own_doctor" ON audit_log
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX idx_audit_doctor ON audit_log(doctor_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
