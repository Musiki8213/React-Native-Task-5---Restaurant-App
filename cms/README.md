# Restaurant Admin CMS

A React-based admin dashboard for managing restaurant content. Built with Vite, TypeScript, and Supabase.

## Features

- **Admin Authentication**: Secure login with Supabase Auth
- **Admin-Only Access**: Only users with `is_admin = true` can access the dashboard
- **Food Item Management**: Add and view food items with image uploads
- **Category Management**: Organize food items by categories
- **Image Storage**: Upload food images to Supabase Storage

## Tech Stack

- **React** (Vite)
- **TypeScript**
- **Supabase** (Auth, Database, Storage)
- **React Router** (Routing)

## Setup Instructions

### 1. Install Dependencies

```bash
cd cms
npm install
```

### 2. Database Setup

Run the SQL script `cms-database-setup.sql` in your Supabase SQL Editor to:
- Create the `categories` table
- Add `category_id` column to `food_items` table
- Add `is_admin` column to `profiles` table
- Set up RLS policies

### 3. Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `food-images`
3. Make it public (or configure policies as needed)

### 4. Create Admin User

In Supabase SQL Editor, run:

```sql
-- Update a user to be admin (replace with actual user email)
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@restaurant.com');
```

### 5. Run Development Server

```bash
npm run dev
```

The CMS will be available at `http://localhost:5173`

## Project Structure

```
cms/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/       # React contexts (Auth)
│   ├── lib/            # Supabase client
│   ├── pages/          # Page components
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── cms-database-setup.sql  # Database setup script
└── README.md
```

## Pages

- **Login** (`/login`): Admin authentication
- **Dashboard** (`/dashboard`): Main dashboard with navigation
- **Add Food Item** (`/add-food-item`): Form to add new food items
- **View Food Items** (`/food-items`): List and manage food items

## Environment

The Supabase credentials are configured in `src/lib/supabase.ts`. These match your existing mobile app's Supabase project.
