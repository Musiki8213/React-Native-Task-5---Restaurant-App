-- =============================================================================
-- AUTH-FIRST PROFILES: Trigger + schema
-- Run in Supabase SQL Editor.
-- - profiles.id matches auth.users.id (source of truth: Supabase Auth).
-- - App must NOT insert into profiles; trigger creates the row on signup.
-- - App only updates the profile after auth (full_name, phone, address, etc.).
-- =============================================================================

-- 1. Ensure profiles table exists with required columns
-- (If you already have profiles with name/contact, we add full_name/phone and backfill.)

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing projects)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Optional: card and legacy name/contact (keep for backward compatibility)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_expiry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_cvc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact TEXT;

-- Backfill full_name/phone from name/contact if present
UPDATE profiles SET full_name = COALESCE(full_name, name) WHERE full_name IS NULL AND name IS NOT NULL;
UPDATE profiles SET phone = COALESCE(phone, contact) WHERE phone IS NULL AND contact IS NOT NULL;

-- 2. Function: create a profile row when a new user is inserted into auth.users
-- Runs with definer rights so it can insert into public.profiles (bypasses RLS for this insert).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Trigger on auth.users: after insert, create profile row
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS: users can only SELECT and UPDATE their own profile (no INSERT from app)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Remove insert-from-app policy so app never inserts (trigger only)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Optional: if you need to allow insert for edge cases (e.g. first login before trigger),
-- keep one insert policy. Prefer not to; the trigger handles it.
-- CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
