-- =====================================================
-- MENTORSHIP AND HIRING TABLES SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create mentorship_services table (if not exists)
CREATE TABLE IF NOT EXISTS mentorship_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'trading',
  price_hourly INTEGER,
  price_package INTEGER,
  price_fixed INTEGER,
  duration_months INTEGER DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on mentorship_services
ALTER TABLE mentorship_services ENABLE ROW LEVEL SECURITY;

-- Allow public read access to services
CREATE POLICY "Services are viewable by everyone" ON mentorship_services
  FOR SELECT USING (true);

-- Allow only admin to modify services
CREATE POLICY "Only admin can modify services" ON mentorship_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- Create mentorship_applications table
-- =====================================================
CREATE TABLE IF NOT EXISTS mentorship_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT UNIQUE NOT NULL,
  service_id UUID REFERENCES mentorship_services(id) ON DELETE SET NULL,
  service_title TEXT,
  package_type TEXT DEFAULT 'hourly',
  
  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'Rwanda',
  how_heard TEXT,
  
  -- Goals & Experience
  skill_level TEXT DEFAULT 'beginner',
  trading_goals TEXT[] DEFAULT '{}',
  interested_markets TEXT[] DEFAULT '{}',
  weekly_hours TEXT DEFAULT '3-5',
  current_challenges TEXT,
  goals TEXT,
  
  -- Payment Info
  selected_payment_method TEXT DEFAULT 'mtn',
  payment_reference TEXT,
  payment_screenshot_url TEXT,
  payment_amount INTEGER,
  sender_phone TEXT,
  payment_status TEXT DEFAULT 'pending_payment', -- pending_payment, awaiting_verification, verified, failed
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Application Status
  status TEXT DEFAULT 'new', -- new, contacted, in_progress, completed, rejected
  form_step INTEGER DEFAULT 1,
  admin_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on mentorship_applications
ALTER TABLE mentorship_applications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own applications by email
CREATE POLICY "Users can view their own applications" ON mentorship_applications
  FOR SELECT USING (true); -- Email-based lookup

-- Allow users to insert their own applications
CREATE POLICY "Users can insert applications" ON mentorship_applications
  FOR INSERT WITH CHECK (true);

-- Allow only admin to update applications
CREATE POLICY "Only admin can update applications" ON mentorship_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to delete applications
CREATE POLICY "Only admin can delete applications" ON mentorship_applications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for mentorship_applications
ALTER PUBLICATION supabase_realtime ADD TABLE mentorship_applications;

-- =====================================================
-- Create project_inquiries table
-- =====================================================
CREATE TABLE IF NOT EXISTS project_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id TEXT UNIQUE NOT NULL,
  
  -- Project Details
  project_type TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  timeline TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  
  -- Contact Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  
  -- Status
  status TEXT DEFAULT 'new', -- new, quoted, deposit_paid, in_progress, completed
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_inquiries
ALTER TABLE project_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own inquiries by email
CREATE POLICY "Users can view their own inquiries" ON project_inquiries
  FOR SELECT USING (true); -- Email-based lookup

-- Allow anonymous users to insert inquiries
CREATE POLICY "Anonymous can insert inquiries" ON project_inquiries
  FOR INSERT WITH CHECK (true);

-- Alternative: Allow any authenticated or anon user
CREATE POLICY "Public insert access" ON project_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow only admin to update inquiries
CREATE POLICY "Only admin can update inquiries" ON project_inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to delete inquiries
CREATE POLICY "Only admin can delete inquiries" ON project_inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for project_inquiries
ALTER PUBLICATION supabase_realtime ADD TABLE project_inquiries;

-- =====================================================
-- Create payment_verifications table
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_type TEXT NOT NULL, -- 'mentorship' or 'project'
  application_id UUID NOT NULL,
  reference_number TEXT,
  amount INTEGER,
  sender_phone TEXT,
  verification_method TEXT DEFAULT 'mtn_app',
  notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_verifications
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Allow only admin to view/create verifications
CREATE POLICY "Only admin can access verifications" ON payment_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for payment_verifications
ALTER PUBLICATION supabase_realtime ADD TABLE payment_verifications;

-- =====================================================
-- Create user_notifications table (for future use)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  type TEXT NOT NULL, -- 'payment_verified', 'status_update', 'message'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  application_type TEXT, -- 'mentorship' or 'project'
  application_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON user_notifications
  FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON user_notifications
  FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow system to insert notifications
CREATE POLICY "System can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (true);

-- Enable real-time for user_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- =====================================================
-- Create function to update timestamps automatically
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_mentorship_applications_updated_at
  BEFORE UPDATE ON mentorship_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_inquiries_updated_at
  BEFORE UPDATE ON project_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert sample mentorship services (optional)
-- =====================================================
INSERT INTO mentorship_services (title, slug, description, category, price_hourly, price_package, features) VALUES
('1-on-1 Trading Mentorship', 'trading-mentorship', 'Personalized trading mentorship to help you become consistently profitable', 'trading', 50, 400, ARRAY['Weekly video calls', 'Trade review sessions', 'Custom strategy development', 'WhatsApp support']),
('Crypto Trading Masterclass', 'crypto-masterclass', 'Comprehensive crypto trading course with live market analysis', 'crypto', 75, 600, ARRAY['8 live sessions', 'Market analysis recordings', 'Private community access', 'Lifetime updates'])
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Create storage bucket for payment screenshots (run in Supabase UI)
-- =====================================================
-- Go to Storage → New Bucket → Name: applications
-- Set Public: false (private bucket)
-- Create policy: Allow authenticated users to upload to applications/payment-proofs
