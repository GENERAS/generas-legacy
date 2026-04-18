-- Testimonials Table for Client Reviews with Voice, Screenshots, and Project Links
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_company TEXT,
  client_position TEXT,
  
  -- Project Information
  project_title TEXT NOT NULL,
  project_description TEXT,
  project_type TEXT DEFAULT 'website', -- website, mobile_app, web_app, trading_bot, other
  project_link TEXT,
  demo_link TEXT,
  
  -- Testimonial Content
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  
  -- Media Files (URLs to Supabase Storage)
  project_screenshot TEXT,
  project_screenshots TEXT[], -- Array for multiple screenshots
  voice_message_en TEXT, -- English voice message URL
  voice_message_rw TEXT, -- Kinyarwanda voice message URL
  
  -- Business Impact Metrics
  clients_before INTEGER,
  clients_after INTEGER,
  revenue_before DECIMAL(12,2),
  revenue_after DECIMAL(12,2),
  
  -- Status and Approval
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin Notes
  admin_notes TEXT
);

-- Enable RLS on testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public to view approved testimonials
CREATE POLICY "Public can view approved testimonials" ON testimonials
  FOR SELECT USING (status = 'approved');

-- Allow public to submit testimonials (pending approval)
CREATE POLICY "Public can submit testimonials" ON testimonials
  FOR INSERT WITH CHECK (status = 'pending');

-- Allow admin to view ALL testimonials (pending, approved, rejected)
CREATE POLICY "Admin can view all testimonials" ON testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to update testimonials (approve/reject)
CREATE POLICY "Only admin can update testimonials" ON testimonials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to delete testimonials
CREATE POLICY "Only admin can delete testimonials" ON testimonials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for testimonials
ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;

-- Create index for faster queries
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX idx_testimonials_project_type ON testimonials(project_type);
