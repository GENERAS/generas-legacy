-- Fix: Drop and recreate the notifications table properly
DROP TABLE IF EXISTS notifications;

-- Create notifications table for admin alerts
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100),
  status VARCHAR(20) DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries on unread notifications
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public to create notifications" ON notifications;
DROP POLICY IF EXISTS "Only admins can view notifications" ON notifications;
DROP POLICY IF EXISTS "Only admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Only admins can delete notifications" ON notifications;

-- Allow anyone to create notifications (for the notify feature)
CREATE POLICY "Allow public to create notifications" ON notifications
  FOR INSERT TO public, authenticated, anon
  WITH CHECK (true);

-- Only allow admins to view notifications (using a simpler check)
CREATE POLICY "Only admins can view notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to update notification status
CREATE POLICY "Only admins can update notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to delete notifications
CREATE POLICY "Only admins can delete notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
