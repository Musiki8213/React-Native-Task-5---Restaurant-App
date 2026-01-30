-- CMS: Admin access to orders and profiles (Order Management + Customer Management)
-- Run this in Supabase SQL Editor
-- Uses is_admin_user() to avoid "infinite recursion in policy for relation profiles".

-- ============================================
-- 0. Helper: check if current user is admin (no recursion)
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon;

-- ============================================
-- 1. Orders: Allow admins to SELECT and UPDATE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (public.is_admin_user() = true);

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (public.is_admin_user() = true)
  WITH CHECK (public.is_admin_user() = true);

-- ============================================
-- 2. Profiles: Allow admins to SELECT and UPDATE (use function, not SELECT from profiles)
-- ============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin_user() = true);

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE
  USING (public.is_admin_user() = true)
  WITH CHECK (public.is_admin_user() = true);

-- ============================================
-- 3. Optional: Add disabled/flag and email to profiles
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disabled_flag BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Optional: Sync email from auth.users (run as trigger or periodically)
-- UPDATE profiles p SET email = u.email FROM auth.users u WHERE u.id = p.id AND p.email IS NULL;
