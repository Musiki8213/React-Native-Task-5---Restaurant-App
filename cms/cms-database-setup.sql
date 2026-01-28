-- CMS Database Setup
-- Run this in your Supabase SQL Editor to ensure tables exist for the CMS

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert default categories if they don't exist
INSERT INTO categories (name) 
SELECT 'Starters'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Starters');

INSERT INTO categories (name) 
SELECT 'Burgers'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Burgers');

INSERT INTO categories (name) 
SELECT 'Mains'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Mains');

INSERT INTO categories (name) 
SELECT 'Desserts'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

INSERT INTO categories (name) 
SELECT 'Beverages'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages');

INSERT INTO categories (name) 
SELECT 'Alcohol'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Alcohol');

-- Update food_items table to use category_id if it doesn't exist
-- First check if category_id column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'food_items' AND column_name = 'category_id'
  ) THEN
    -- Add category_id column
    ALTER TABLE food_items ADD COLUMN category_id UUID REFERENCES categories(id);
    
    -- Migrate existing category data to category_id
    -- This maps the TEXT category to category_id
    UPDATE food_items fi
    SET category_id = c.id
    FROM categories c
    WHERE LOWER(fi.category) = LOWER(c.name);
  END IF;
END $$;

-- Add is_admin column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create food-images storage bucket if it doesn't exist
-- Note: This needs to be done in Supabase Storage UI, but here's the SQL reference
-- INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- RLS Policies for categories (public read, admin write)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
