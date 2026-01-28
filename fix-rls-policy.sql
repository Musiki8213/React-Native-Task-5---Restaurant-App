-- Fix RLS Policy for Profiles Table
-- Run this in your Supabase SQL Editor to fix the "row-level security policy" error

-- Step 1: Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 2: Create a new insert policy that allows users to insert their own profile
-- This policy checks that the user is authenticated and the id matches
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Step 3 (RECOMMENDED): Create a database function to handle profile creation
-- This bypasses RLS by using SECURITY DEFINER and ensures profile is created automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, contact, address, card_name, card_number, card_expiry, card_cvc)
  VALUES (NEW.id, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: After running this, the app will automatically create a profile row when a user signs up
-- Then the registration step3 can update that profile with the user's information
