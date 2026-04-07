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
