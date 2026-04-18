-- FIX: Increase field sizes to prevent numeric overflow
-- Run this in Supabase SQL Editor

-- Drop and recreate testimonials table with larger fields
DROP TABLE IF EXISTS testimonials;

CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_company TEXT,
  client_position TEXT,
  
  -- Project Information
  project_title TEXT NOT NULL,
  project_description TEXT,
  project_type TEXT DEFAULT 'website',
  project_link TEXT,
  demo_link TEXT,
  
  -- Testimonial Content
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  
  -- Media Files
  project_screenshot TEXT,
  project_screenshots TEXT[],
  voice_message_en TEXT,
  voice_message_rw TEXT,
  
  -- Business Impact Metrics (increased sizes)
  clients_before INTEGER,
  clients_after INTEGER,
  revenue_before NUMERIC,  -- No limit, accepts any size
  revenue_after NUMERIC,   -- No limit, accepts any size
  
  -- Status and Approval
  status TEXT DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin Notes
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view approved testimonials" ON testimonials
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can submit testimonials" ON testimonials
  FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "Admin can view all testimonials" ON testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

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

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;

-- Indexes
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
