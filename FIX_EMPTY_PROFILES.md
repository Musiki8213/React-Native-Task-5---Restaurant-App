# Fix Empty Profiles Table

If your `profiles` table is empty, this guide will help you fix it.

## Problem

When users register, their profiles should be created automatically, but sometimes this doesn't happen. This can be due to:
- Missing database trigger
- RLS (Row Level Security) policies blocking profile creation
- Trigger function not including `is_admin` column

## Solution: Run the Fix Script

### Step 1: Run the SQL Fix Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `fix-profiles-setup.sql` from your project
3. Copy the entire SQL script
4. Paste it into the SQL Editor
5. Click **"Run"**

This script will:
- ✅ Add `is_admin` column if missing
- ✅ Create/update the trigger function to auto-create profiles
- ✅ Set up the trigger on `auth.users` table
- ✅ Fix RLS policies to allow profile creation
- ✅ Create profiles for existing users who don't have one

### Step 2: Verify It Worked

Run this query to check:

```sql
-- Check users vs profiles
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE is_admin = true) as admin_count
FROM auth.users;
```

You should see:
- `total_users` = number of registered users
- `total_profiles` = should match `total_users` (or be close)
- `admin_count` = number of admins (probably 0)

### Step 3: Create Profiles for Existing Users

If you have existing users without profiles, run this:

```sql
-- Create profiles for all users who don't have one
INSERT INTO profiles (id, is_admin)
SELECT 
  u.id,
  false -- Default to not admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## How It Works Now

### Automatic Profile Creation

After running the fix script:

1. **When a user registers** (via mobile app or CMS):
   - User account is created in `auth.users`
   - **Trigger automatically fires**
   - Profile is created in `profiles` table with `is_admin = false`

2. **The trigger function** (`handle_new_user`):
   - Runs automatically when a new user is inserted into `auth.users`
   - Creates a profile row with the user's ID
   - Sets `is_admin = false` by default
   - Uses `SECURITY DEFINER` to bypass RLS (so it always works)

### Manual Profile Creation (Fallback)

If the trigger doesn't work, the registration code will try to create the profile manually. But the trigger should handle it automatically.

## Testing

### Test 1: Register a New User

1. Register a new user via mobile app or CMS
2. Check Supabase Dashboard → Table Editor → profiles
3. You should see a new row with that user's ID and `is_admin = false`

### Test 2: Check Trigger

Run this to verify the trigger exists:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see the trigger listed.

### Test 3: Check Function

Run this to verify the function exists:

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

You should see the function listed.

## Troubleshooting

### Profiles Still Not Creating

1. **Check if trigger exists:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Check if function exists:**
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

3. **Manually create profile for a user:**
   ```sql
   -- Replace 'user-uuid-here' with actual user ID
   INSERT INTO profiles (id, is_admin)
   VALUES ('user-uuid-here', false);
   ```

### RLS Policy Errors

If you see RLS policy errors:

1. Run the RLS fix script:
   ```sql
   -- From fix-rls-policy.sql
   DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT 
     WITH CHECK (auth.uid() = id);
   ```

### Trigger Not Firing

If the trigger isn't firing:

1. **Recreate the trigger:**
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

2. **Check Supabase logs** for errors

## Quick Fix Commands

### Create Profile for Specific User

```sql
-- Get user ID first
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Then create profile (replace UUID with actual ID)
INSERT INTO profiles (id, is_admin)
VALUES ('user-uuid-here', false)
ON CONFLICT (id) DO NOTHING;
```

### Create Profiles for All Missing Users

```sql
INSERT INTO profiles (id, is_admin)
SELECT 
  u.id,
  false
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Make User an Admin

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

## After Fixing

Once profiles are being created automatically:

1. ✅ New registrations will create profiles automatically
2. ✅ All existing users will have profiles
3. ✅ You can grant admin access via SQL
4. ✅ CMS login will work for admins

## Summary

**The fix script (`fix-profiles-setup.sql`) does everything:**
- Sets up automatic profile creation
- Creates profiles for existing users
- Fixes RLS policies
- Includes `is_admin` column

**Just run it once and profiles will be created automatically for all future registrations!**
