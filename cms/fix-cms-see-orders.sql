-- Fix: CMS Orders page not showing any orders
-- Cause: RLS only allows users to see their own orders. Admins need a policy to see ALL orders.
-- Run this in Supabase SQL Editor (you must be logged in as a user who has is_admin = true in profiles).

-- 1. Allow admins to SELECT all orders (so Order Management page shows every order)
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 2. Allow admins to UPDATE orders (so you can change status)
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
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
