-- Create testimonials storage bucket for screenshots and voice messages
-- Run this in your Supabase SQL Editor

-- Create the testimonials bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public to view testimonials files
CREATE POLICY "Public can view testimonials"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonials');

-- Policy: Allow public to upload testimonials files
CREATE POLICY "Public can upload testimonials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'testimonials');

-- Policy: Allow admin to delete testimonials files
CREATE POLICY "Admin can delete testimonials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'testimonials'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
