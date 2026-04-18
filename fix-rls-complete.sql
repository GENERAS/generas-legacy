-- =====================================================
-- COMPLETE RLS FIX FOR coffee_supporters
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Step 1: Enable RLS (safe to run even if already enabled)
ALTER TABLE coffee_supporters ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on this table
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'coffee_supporters'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON coffee_supporters', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Create fresh policies

-- Policy 1: Allow ANYONE to insert (anonymous users submitting payments)
CREATE POLICY "allow_anon_insert" ON coffee_supporters
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 2: Allow ANYONE to view verified supporters (where show_in_hall = true)
CREATE POLICY "allow_public_select_verified" ON coffee_supporters
    FOR SELECT 
    TO anon, authenticated
    USING (show_in_hall = true);

-- Policy 3: Allow admin to do everything
CREATE POLICY "allow_admin_all" ON coffee_supporters
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Step 4: Grant basic permissions
GRANT SELECT, INSERT ON coffee_supporters TO anon;
GRANT SELECT, INSERT ON coffee_supporters TO authenticated;

-- Step 5: Verify policies were created
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'coffee_supporters';
