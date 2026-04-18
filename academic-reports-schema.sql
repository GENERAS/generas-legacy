-- Create academic_level_reports table for school reports and photos
CREATE TABLE IF NOT EXISTS academic_level_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id BIGINT REFERENCES academic_levels(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('school_report', 'uniform_photo', 'school_photo')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  academic_year TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on academic_level_reports
ALTER TABLE academic_level_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to academic level reports
CREATE POLICY "Academic level reports are viewable by everyone" ON academic_level_reports
  FOR SELECT USING (true);

-- Allow only admin to insert academic level reports
CREATE POLICY "Only admin can insert academic level reports" ON academic_level_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to update academic level reports
CREATE POLICY "Only admin can update academic level reports" ON academic_level_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to delete academic level reports
CREATE POLICY "Only admin can delete academic level reports" ON academic_level_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for academic_level_reports
ALTER PUBLICATION supabase_realtime ADD TABLE academic_level_reports;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_academic_level_reports_level_id ON academic_level_reports(level_id);
CREATE INDEX IF NOT EXISTS idx_academic_level_reports_type ON academic_level_reports(report_type);
