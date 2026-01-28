# Troubleshoot Login Issues

## Problem: "Invalid login credentials"

This error means the email/password doesn't match an account in Supabase Auth. Setting `is_admin = true` in the profiles table doesn't create an account - you need to register first!

## Step-by-Step Fix

### Step 1: Check if User Exists in Auth

Run this SQL in Supabase SQL Editor:

```sql
-- Check if user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

**If this returns NO ROWS:**
- The account doesn't exist → You need to register first (see Step 2)

**If this returns a row:**
- The account exists → Password might be wrong (see Step 3)

### Step 2: Register the Account First

You MUST register before you can login. Choose one:

#### Option A: Register via CMS (Easiest)

1. Go to `http://localhost:5173/register`
2. Enter your email and password
3. Click "Register"
4. Then set `is_admin = true` (see Step 4)

#### Option B: Register via Mobile App

1. Open your mobile app
2. Go to registration screen
3. Complete the registration process
4. Then set `is_admin = true` (see Step 4)

### Step 3: Reset Password (If Account Exists)

If the account exists but password is wrong:

#### Option A: Use Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user
3. Click the three dots → **Reset Password**
4. Check your email for reset link

#### Option B: Use SQL to Reset (Not Recommended)

⚠️ **Warning**: This requires direct database access and is not recommended. Better to use the dashboard.

### Step 4: Set Admin Status AFTER Registration

**Important**: You can only set `is_admin = true` AFTER the user has registered!

1. **First**, register the account (Step 2)
2. **Then**, run this SQL:

```sql
-- Make user an admin (AFTER they've registered)
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Step 5: Verify Everything

Run this to check everything is set up correctly:

```sql
-- Check user and profile
SELECT 
  u.email,
  u.created_at as user_created,
  p.is_admin,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
```

You should see:
- ✅ User exists (`user_created` has a date)
- ✅ Profile exists (`profile_created` has a date)
- ✅ `is_admin = true`

## Common Mistakes

### ❌ Mistake 1: Setting admin before registering
```
Wrong: Create profile → Set is_admin = true → Try to login
Right: Register → Profile auto-created → Set is_admin = true → Login
```

### ❌ Mistake 2: Wrong email
- Make sure you're using the EXACT email you registered with
- Check for typos
- Check case sensitivity

### ❌ Mistake 3: Wrong password
- Passwords are case-sensitive
- Make sure Caps Lock is off
- Try resetting password

## Complete Setup Process

### For New Admin (First Time)

1. **Register Account:**
   ```
   Go to http://localhost:5173/register
   Enter: email, password, confirm password
   Click: Register
   ```

2. **Set Admin Status:**
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

3. **Login:**
   ```
   Go to http://localhost:5173/login
   Enter: email, password
   Click: Sign In
   ```

### For Existing User (Make Admin)

1. **Check if user exists:**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'user@example.com';
   ```

2. **If user exists, set admin:**
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
   ```

3. **If profile doesn't exist, create it:**
   ```sql
   INSERT INTO profiles (id, is_admin)
   SELECT id, true
   FROM auth.users
   WHERE email = 'user@example.com'
   ON CONFLICT (id) DO UPDATE SET is_admin = true;
   ```

## Quick Diagnostic Queries

### Check if user exists:
```sql
SELECT * FROM auth.users WHERE email = 'your-email@example.com';
```

### Check if profile exists:
```sql
SELECT * FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Check admin status:
```sql
SELECT 
  u.email,
  p.is_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
```

## Still Having Issues?

1. **Clear browser cache and cookies**
2. **Try incognito/private mode**
3. **Check browser console for errors** (F12)
4. **Verify Supabase project URL and keys** in `cms/src/lib/supabase.ts`
5. **Check Supabase Dashboard → Authentication → Users** to see if account exists

## Summary

**The key point:** You MUST register an account BEFORE you can login. Setting `is_admin = true` in the profiles table doesn't create an account - it only grants admin privileges to an existing account.

**Correct order:**
1. Register → Creates account in `auth.users` → Creates profile in `profiles`
2. Set `is_admin = true` → Grants admin access
3. Login → Works!
