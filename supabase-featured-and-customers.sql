-- Featured dishes + Customer management fields
-- Run in Supabase SQL Editor

-- ============================================
-- 1. food_items: featured fields
-- ============================================
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS featured_title TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS featured_order INTEGER;

-- ============================================
-- 2. profiles: is_active for customer flag/disable
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Sync existing disabled_flag into is_active (if you used disabled_flag before)
UPDATE profiles SET is_active = COALESCE(NOT disabled_flag, true) WHERE is_active IS NULL;
