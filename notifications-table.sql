-- Create notifications table for admin alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100),
  status VARCHAR(20) DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries on unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create notifications (for the notify feature)
CREATE POLICY "Allow public to create notifications" ON notifications
  FOR INSERT TO public, authenticated, anon
  WITH CHECK (true);

-- Only allow admins to view notifications
CREATE POLICY "Only admins can view notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      SELECT email FROM admin_users
    )
  ));

-- Allow admins to update notification status
CREATE POLICY "Only admins can update notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      SELECT email FROM admin_users
    )
  ));

-- Allow admins to delete notifications
CREATE POLICY "Only admins can delete notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      SELECT email FROM admin_users
    )
  ));
