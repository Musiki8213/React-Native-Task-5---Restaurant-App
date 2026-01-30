-- Fix: "Access denied" when CMS tries to load orders
-- Run this entire script in Supabase SQL Editor.
-- Then ensure YOUR CMS login user has is_admin = true (Step 4 below).

-- ============================================
-- 1. Function that checks if current user is admin (bypasses RLS)
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

-- ============================================
-- 2. Orders: policies using the function
-- ============================================
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (public.is_admin_user() = true);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (public.is_admin_user() = true)
  WITH CHECK (public.is_admin_user() = true);

-- ============================================
-- 3. Profiles: use function so policies don't reference profiles (avoids recursion)
-- ============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (public.is_admin_user() = true);

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE
  USING (public.is_admin_user() = true)
  WITH CHECK (public.is_admin_user() = true);

-- ============================================
-- 4. Grant execute (needed for RLS)
-- ============================================
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon;

-- ============================================
-- 5. Ensure every auth user has a profile (run once)
-- ============================================
INSERT INTO public.profiles (id, is_admin)
SELECT u.id, false
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. Make your CMS user an admin (REQUIRED)
--    Replace your@email.com with the email you use to log into the CMS, then run:
-- ============================================
-- UPDATE public.profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com' LIMIT 1);

-- Or: Table Editor → profiles → find your row → set is_admin = true → Save
-- To find your user first: Authentication → Users (or run: SELECT id, email FROM auth.users;)
