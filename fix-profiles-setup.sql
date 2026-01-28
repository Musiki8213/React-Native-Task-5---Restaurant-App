-- Fix Profiles Table Setup
-- Run this in Supabase SQL Editor to ensure profiles are created automatically

-- Step 1: Ensure is_admin column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Create or replace the function to handle new user creation
-- This function will create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin, name, contact, address, card_name, card_number, card_expiry, card_cvc)
  VALUES (
    NEW.id, 
    false, -- Default to not admin
    NULL, 
    NULL, 
    NULL, 
    NULL, 
    NULL, 
    NULL, 
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Ensure RLS policies allow profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Step 6: Create profiles for existing users who don't have one
-- This fixes users who registered before the trigger was set up
INSERT INTO profiles (id, is_admin)
SELECT 
  u.id,
  false -- Default to not admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 7: Verify setup
-- Check how many users have profiles
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE is_admin = true) as admin_count
FROM auth.users;
