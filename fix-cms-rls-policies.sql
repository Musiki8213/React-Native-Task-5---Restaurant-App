-- Fix CMS RLS Policies for Food Items and Storage
-- Run this in Supabase SQL Editor to fix "new row violates row-level security policy" errors

-- ============================================
-- PART 1: Fix Food Items Table RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view food items" ON food_items;
DROP POLICY IF EXISTS "Admins can manage food items" ON food_items;
DROP POLICY IF EXISTS "Admins can insert food items" ON food_items;
DROP POLICY IF EXISTS "Admins can update food items" ON food_items;
DROP POLICY IF EXISTS "Admins can delete food items" ON food_items;

-- Policy: Anyone can view food items (public read)
CREATE POLICY "Anyone can view food items" ON food_items
  FOR SELECT USING (true);

-- Policy: Admins can INSERT food items
CREATE POLICY "Admins can insert food items" ON food_items
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can UPDATE food items
CREATE POLICY "Admins can update food items" ON food_items
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can DELETE food items
CREATE POLICY "Admins can delete food items" ON food_items
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- PART 2: Fix Storage Bucket Policies
-- ============================================

-- Note: Storage policies are applied to storage.objects table
-- Make sure 'food-images' bucket exists and is public in Storage UI first

-- Drop existing storage policies for food-images bucket
DROP POLICY IF EXISTS "Anyone can view food images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload food images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update food images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete food images" ON storage.objects;

-- Policy: Anyone can view/download images (public read)
CREATE POLICY "Anyone can view food images"
ON storage.objects FOR SELECT
USING (bucket_id = 'food-images');

-- Policy: Authenticated admins can upload images
CREATE POLICY "Admins can upload food images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'food-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Authenticated admins can update images
CREATE POLICY "Admins can update food images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'food-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  bucket_id = 'food-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Authenticated admins can delete images
CREATE POLICY "Admins can delete food images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'food-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================
-- PART 3: Verify Your Admin Status
-- ============================================

-- Check current user's admin status
-- This will show NULL if not logged in, or your admin status if logged in
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_email,
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) as is_admin_status;

-- Check all admins
SELECT 
  u.email,
  p.is_admin,
  CASE 
    WHEN p.is_admin = true THEN '✅ Admin'
    ELSE '❌ Not Admin'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true;

-- ============================================
-- PART 4: Make Sure Storage Bucket Exists
-- ============================================

-- Check if bucket exists (this will show the bucket if it exists)
SELECT * FROM storage.buckets WHERE id = 'food-images';

-- If the bucket doesn't exist, create it via Storage UI:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: food-images
-- 4. Make it Public
-- 5. Click "Create bucket"
