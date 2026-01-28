# Admin Setup Guide

This guide explains how admin accounts work and how to grant admin access.

## How Admin System Works

### 1. **Registration Process**

There are TWO ways to register:

#### Option A: Register via CMS (New!)
- Go to `http://localhost:5173/register`
- Fill in email, password, and confirm password
- Click "Register"
- **Important**: New accounts are created with `is_admin = false` by default
- You'll need to manually grant admin access (see below)

#### Option B: Register via Mobile App
- Register through your mobile app's registration flow
- Account is created in `auth.users` table
- Profile is created in `profiles` table with `is_admin = false` by default

### 2. **How Admin Status is Stored**

Admin status is stored in the `profiles` table:
- Column: `is_admin` (BOOLEAN)
- Default value: `false`
- Location: `profiles.is_admin`

### 3. **How to Grant Admin Access**

After someone registers, you need to manually set `is_admin = true`. There are two ways:

#### Method 1: Using SQL (Recommended for First Admin)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace with actual email):

```sql
-- Make a user an admin
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

3. The user can now login to the CMS at `http://localhost:5173`

#### Method 2: Using Supabase Dashboard

1. Go to **Supabase Dashboard** → **Table Editor** → **profiles**
2. Find the user's row
3. Click to edit
4. Set `is_admin` to `true`
5. Save

### 4. **How the System Checks Admin Status**

When someone tries to login to the CMS:

1. **Login**: User enters email/password → Supabase Auth verifies credentials
2. **Profile Check**: System checks `profiles.is_admin` for that user
3. **Access Granted**: If `is_admin = true`, user can access dashboard
4. **Access Denied**: If `is_admin = false` or doesn't exist, user is signed out and sees error

## Step-by-Step: Creating Your First Admin

### Step 1: Register an Account

**Via CMS:**
1. Go to `http://localhost:5173/register`
2. Enter email: `admin@restaurant.com`
3. Enter password (min 6 characters)
4. Confirm password
5. Click "Register"
6. You'll be redirected to login page

**Via Mobile App:**
1. Open your mobile app
2. Go to registration screen
3. Complete registration with your email

### Step 2: Grant Admin Access

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (use YOUR email):

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@restaurant.com');
```

### Step 3: Login to CMS

1. Go to `http://localhost:5173/login`
2. Enter your email and password
3. Click "Sign In"
4. You should now see the Dashboard!

## Checking Admin Status

### View All Admins

Run this SQL in Supabase SQL Editor:

```sql
SELECT 
  u.email,
  p.is_admin,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true;
```

### Check Specific User

```sql
SELECT 
  u.email,
  p.is_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'user@example.com';
```

## Removing Admin Access

To remove admin access from a user:

```sql
UPDATE profiles 
SET is_admin = false 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

## Troubleshooting

### "Access denied" Error
- **Cause**: User's `is_admin` is `false` or `NULL`
- **Fix**: Run the UPDATE SQL to set `is_admin = true`

### Profile Doesn't Exist
- **Cause**: Profile wasn't created during registration
- **Fix**: Run this SQL:

```sql
INSERT INTO profiles (id, is_admin)
SELECT id, true
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

### Can't Find User in Profiles Table
- **Cause**: Profile creation might have failed
- **Fix**: Check if user exists in `auth.users`:

```sql
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

Then create profile manually:

```sql
INSERT INTO profiles (id, is_admin)
VALUES ('user-uuid-here', true);
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Admin Access is Powerful**: Admins can add/edit/delete food items
2. **Limit Admin Accounts**: Only grant admin access to trusted users
3. **Regular Audits**: Periodically check who has admin access
4. **Strong Passwords**: Ensure admins use strong passwords
5. **Monitor Activity**: Check Supabase logs for admin actions

## Quick Reference

- **CMS Login**: `http://localhost:5173/login`
- **CMS Register**: `http://localhost:5173/register`
- **Admin Column**: `profiles.is_admin` (BOOLEAN)
- **Default Value**: `false`
- **Grant Admin**: `UPDATE profiles SET is_admin = true WHERE id = ...`

## Example Workflow

1. **New Admin Registration:**
   ```
   User registers → Profile created (is_admin = false) → 
   Admin grants access via SQL → User can login to CMS
   ```

2. **Existing User Becomes Admin:**
   ```
   User already registered → Admin runs SQL → 
   User can now login to CMS
   ```

3. **Admin Login:**
   ```
   User enters credentials → System checks is_admin → 
   If true: Access granted | If false: Access denied
   ```
