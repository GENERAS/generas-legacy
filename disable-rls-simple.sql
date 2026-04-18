-- SIMPLEST FIX: Temporarily disable RLS to allow submissions
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS completely (simplest, works immediately)
ALTER TABLE coffee_supporters DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS but allow all actions
-- (uncomment below and comment out Option 1 above)
-- ALTER TABLE coffee_supporters ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "allow_all" ON coffee_supporters;
-- CREATE POLICY "allow_all" ON coffee_supporters FOR ALL USING (true) WITH CHECK (true);
