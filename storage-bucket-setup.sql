-- =====================================================
-- STORAGE BUCKET SETUP FOR PAYMENT SCREENSHOTS
-- Run this in Supabase SQL Editor to create the bucket
-- =====================================================

-- Create the payment-screenshots bucket
-- Note: This requires using Supabase Dashboard or Storage API
-- SQL cannot directly create buckets, use the Dashboard instead:
-- Storage > Buckets > New Bucket > "payment-screenshots"

-- Alternative: Create bucket via Supabase CLI or Dashboard
-- Bucket name: payment-screenshots
-- Public: true (for viewing screenshots)
-- Allowed MIME types: image/*
-- File size limit: 5MB

-- RLS Policies for the bucket (run after creating bucket in Dashboard):

-- Allow public to upload to payment-screenshots
CREATE POLICY "Allow public uploads to payment-screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Allow public to view payment-screenshots
CREATE POLICY "Allow public to view payment-screenshots" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-screenshots');

-- Allow admin to delete from payment-screenshots
CREATE POLICY "Allow admin to delete from payment-screenshots" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'payment-screenshots' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
