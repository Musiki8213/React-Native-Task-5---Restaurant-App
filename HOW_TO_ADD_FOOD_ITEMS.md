# How to Add Food Items and Images to Supabase

This guide will walk you through adding food items with images to your Supabase database using the CMS.

## Prerequisites

1. **Supabase Project Setup**: Make sure your Supabase project is running
2. **CMS Running**: The CMS should be running at `http://localhost:5173`
3. **Admin Account**: You need an admin account to access the CMS

---

## Step 1: Set Up Supabase Storage Bucket

1. **Go to Supabase Dashboard**
   - Open your Supabase project dashboard
   - Navigate to **Storage** in the left sidebar

2. **Create Storage Bucket**
   - Click **"New bucket"** or **"Create bucket"**
   - Name: `food-images`
   - **Important**: Make it **Public** (toggle "Public bucket" to ON)
   - Click **"Create bucket"**

3. **Set Storage Policies** (if needed)
   - Go to **Storage** → **Policies**
   - Ensure the `food-images` bucket allows public read access
   - For uploads, you may need to add a policy that allows authenticated users to upload

---

## Step 2: Set Up Database Tables

1. **Run Database Setup Script**
   - Go to **SQL Editor** in Supabase Dashboard
   - Open the file `cms/cms-database-setup.sql` from your project
   - Copy and paste the entire SQL script
   - Click **"Run"** to execute

   This will:
   - Create the `categories` table
   - Add `category_id` column to `food_items` table
   - Create default categories (Starters, Burgers, Mains, Desserts, Beverages, Alcohol)
   - Set up Row Level Security (RLS) policies

---

## Step 3: Create an Admin User

1. **Register/Login to Your App**
   - First, register a user account through your mobile app or Supabase Auth
   - Note the email address you used

2. **Make User an Admin**
   - Go to **SQL Editor** in Supabase Dashboard
   - Run this SQL (replace `your-email@example.com` with your actual email):

   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

   Or if the profile doesn't exist yet:

   ```sql
   INSERT INTO profiles (id, is_admin)
   SELECT id, true
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (id) DO UPDATE SET is_admin = true;
   ```

---

## Step 4: Access the CMS

1. **Open CMS in Browser**
   - Navigate to `http://localhost:5173`
   - You should see the login page

2. **Login as Admin**
   - Use the email and password of the admin account you just created
   - Click **"Sign In"**
   - You'll be redirected to the Dashboard

---

## Step 5: Add Food Items with Images

1. **Navigate to Add Food Item**
   - From the Dashboard, click **"Add Food Item"** card
   - Or go directly to `http://localhost:5173/add-food-item`

2. **Fill Out the Form**
   - **Name**: Enter the food item name (e.g., "Honey Glazed Chicken Medallions")
   - **Description**: Enter a description of the item
   - **Price**: Enter the price (e.g., "89.00")
   - **Category**: Select a category from the dropdown (Starters, Burgers, Mains, etc.)
   - **Image**: Click "Choose File" and select an image from your computer

3. **Image Requirements**
   - Supported formats: JPG, PNG, GIF, WebP
   - Recommended size: 800x600px or larger
   - File size: Keep under 5MB for best performance

4. **Preview Image**
   - After selecting an image, you'll see a preview
   - Make sure the image looks good before submitting

5. **Submit the Form**
   - Click **"Add Food Item"** button
   - The image will be uploaded to Supabase Storage
   - The food item will be saved to the database
   - You'll be redirected to the Food Items list

---

## Step 6: Verify Items in Database

1. **View in CMS**
   - Go to **"View Food Items"** from the Dashboard
   - You should see all your added items with images

2. **Check in Supabase**
   - Go to **Table Editor** → **food_items** in Supabase Dashboard
   - You should see your items with `image_url` pointing to Supabase Storage

3. **Check Storage**
   - Go to **Storage** → **food-images** bucket
   - You should see all uploaded images

---

## Step 7: View in Mobile App

1. **Refresh Your App**
   - The mobile app automatically fetches items from the database
   - New items should appear immediately (or after a refresh)

2. **Images Should Load**
   - Images are loaded from Supabase Storage URLs
   - They should display automatically in:
     - Home screen
     - Category pages
     - Item detail pages
     - Cart

---

## Troubleshooting

### Images Not Showing
- **Check Storage Bucket**: Make sure `food-images` bucket is **Public**
- **Check Image URL**: Verify the `image_url` in the database is correct
- **Check Storage Policies**: Ensure public read access is enabled

### Can't Login to CMS
- **Check Admin Status**: Verify `is_admin = true` in profiles table
- **Check Email**: Make sure you're using the correct email
- **Check Password**: Reset password if needed in Supabase Auth

### Upload Fails
- **Check File Size**: Try a smaller image file
- **Check File Format**: Use JPG or PNG format
- **Check Storage Policies**: Ensure upload policies are set correctly

### Items Not Appearing in App
- **Check Database**: Verify items exist in `food_items` table
- **Check Category**: Make sure category_id matches a category in categories table
- **Refresh App**: Try refreshing or restarting the app

---

## Quick Reference

**CMS URL**: `http://localhost:5173`  
**Storage Bucket**: `food-images` (must be public)  
**Database Tables**: `food_items`, `categories`  
**Admin Column**: `profiles.is_admin = true`

---

## Example: Adding a Burger

1. Login to CMS at `http://localhost:5173`
2. Click "Add Food Item"
3. Fill in:
   - Name: "Classic Beef Burger"
   - Description: "Juicy beef patty with fresh vegetables"
   - Price: "95.00"
   - Category: "Burgers"
   - Image: Select burger image file
4. Click "Add Food Item"
5. Done! The burger now appears in your app.

---

## Tips

- **Batch Upload**: You can add multiple items one at a time
- **Image Optimization**: Compress images before uploading for faster loading
- **Consistent Naming**: Use consistent naming for easier management
- **Categories**: Make sure to select the correct category for proper organization
