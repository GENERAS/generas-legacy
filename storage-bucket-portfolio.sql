-- =====================================================
-- STORAGE BUCKET SETUP FOR PORTFOLIO STORAGE
-- Run this in Supabase SQL Editor to create the bucket
-- =====================================================

-- NOTE: You must first create the bucket in Supabase Dashboard:
-- 1. Go to Storage > Buckets > New Bucket
-- 2. Bucket name: portfolio-storage
-- 3. Public: true (for viewing files)
-- 4. Allowed MIME types: image/*, application/pdf
-- 5. File size limit: 10MB

-- Then run these RLS policies:

-- Allow public to view files from portfolio-storage
CREATE POLICY "Allow public to view portfolio-storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio-storage');

-- Allow admin to upload to portfolio-storage
CREATE POLICY "Allow admin to upload to portfolio-storage" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'portfolio-storage'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admin to update files in portfolio-storage
CREATE POLICY "Allow admin to update portfolio-storage" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'portfolio-storage'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admin to delete from portfolio-storage
CREATE POLICY "Allow admin to delete from portfolio-storage" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'portfolio-storage'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
