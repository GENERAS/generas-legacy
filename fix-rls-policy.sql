-- =====================================================
-- FIX RLS POLICY FOR project_inquiries
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'project_inquiries';

-- Step 2: Disable RLS completely (QUICK FIX)
ALTER TABLE project_inquiries DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'project_inquiries';
-- Should return 'f' (false) meaning RLS is OFF

-- =====================================================
-- ALTERNATIVE: Keep RLS but allow anonymous inserts
-- =====================================================
-- Only run this if you want to keep RLS enabled
/*
-- Enable RLS
ALTER TABLE project_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Users can insert inquiries" ON project_inquiries;
DROP POLICY IF EXISTS "Anonymous can insert inquiries" ON project_inquiries;
DROP POLICY IF EXISTS "Allow all inserts" ON project_inquiries;
DROP POLICY IF EXISTS "Public insert access" ON project_inquiries;

-- Create new policy allowing anyone to insert
CREATE POLICY "Allow anonymous inserts" ON project_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to view their own inquiries
DROP POLICY IF EXISTS "Users can view their own inquiries" ON project_inquiries;
CREATE POLICY "Allow select by email" ON project_inquiries
  FOR SELECT USING (true);
*/
