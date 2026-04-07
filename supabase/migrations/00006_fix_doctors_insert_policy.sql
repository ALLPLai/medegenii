-- Fix: the original "doctors_own_data" policy uses FOR ALL with USING only,
-- which blocks INSERT because USING doesn't cover new rows.
-- Replace with separate SELECT/UPDATE/DELETE (USING) and INSERT (WITH CHECK) policies.

DROP POLICY IF EXISTS "doctors_own_data" ON doctors;

-- Allow doctors to read/update/delete their own data
CREATE POLICY "doctors_select_own" ON doctors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "doctors_update_own" ON doctors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "doctors_delete_own" ON doctors
  FOR DELETE USING (auth.uid() = id);

-- Allow authenticated users to insert their own doctor record
CREATE POLICY "doctors_insert_own" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);
