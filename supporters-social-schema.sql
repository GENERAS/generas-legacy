-- =====================================================
-- SUPPORTERS HALL SOCIAL MEDIA & PRIZE TIER UPDATE
-- Add social media columns and update prize tiers
-- =====================================================

-- Add social media columns to coffee_supporters table
ALTER TABLE coffee_supporters 
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update prize tier logic - based on amount paid (not just coffee count)
-- Bronze: $1-$10, Silver: $11-$50, Gold: $51+, Platinum: $100+

-- Add/update level calculation based on amount
UPDATE coffee_supporters 
SET level = CASE 
    WHEN amount >= 100 THEN 'platinum'
    WHEN amount >= 51 THEN 'gold'
    WHEN amount >= 11 THEN 'silver'
    ELSE 'bronze'
END
WHERE level IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_coffee_supporters_level ON coffee_supporters(level);
