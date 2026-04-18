-- =====================================================
-- COFFEE SUPPORTERS SCHEMA UPDATE
-- Add payment verification workflow for MTN payments
-- =====================================================

-- Add new columns to coffee_supporters table
ALTER TABLE coffee_supporters 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mtn',
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS sender_phone TEXT,
ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update existing records to have payment_status if not set
UPDATE coffee_supporters 
SET payment_status = 'verified', 
    verified_at = created_at,
    amount = cups * 1  -- Assuming $1 per cup
WHERE payment_status IS NULL;

-- Enable RLS if not already enabled
ALTER TABLE coffee_supporters ENABLE ROW LEVEL SECURITY;

-- Allow public to insert new supporters (for payment submission)
DROP POLICY IF EXISTS "Allow public to submit supporter payments" ON coffee_supporters;
CREATE POLICY "Allow public to submit supporter payments" ON coffee_supporters
  FOR INSERT WITH CHECK (true);

-- Allow public to view verified supporters only (shown in hall)
DROP POLICY IF EXISTS "Public can view verified supporters" ON coffee_supporters;
CREATE POLICY "Public can view verified supporters" ON coffee_supporters
  FOR SELECT USING (payment_status = 'verified' AND show_in_hall = true);

-- Allow admin full access
DROP POLICY IF EXISTS "Only admin can manage all supporters" ON coffee_supporters;
CREATE POLICY "Only admin can manage all supporters" ON coffee_supporters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_coffee_supporters_payment_status ON coffee_supporters(payment_status);
CREATE INDEX IF NOT EXISTS idx_coffee_supporters_show_in_hall ON coffee_supporters(show_in_hall);
CREATE INDEX IF NOT EXISTS idx_coffee_supporters_cups ON coffee_supporters(cups DESC);
