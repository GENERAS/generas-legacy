-- FIX: Add admin SELECT policy to testimonials table
-- Run this in Supabase SQL Editor to allow admin to view all testimonials

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Admin can view all testimonials" ON testimonials;

-- Create policy allowing admin to view ALL testimonials regardless of status
CREATE POLICY "Admin can view all testimonials" ON testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Also verify other admin policies exist
DROP POLICY IF EXISTS "Only admin can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Only admin can delete testimonials" ON testimonials;

CREATE POLICY "Only admin can update testimonials" ON testimonials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admin can delete testimonials" ON testimonials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
