# Restaurant App – Documentation

This document describes how to run the **mobile app** (React Native / Expo) and the **CMS** (web admin), and links to the design.

---

## Design (Figma)

UI design and screens for the restaurant app:

**[Figma – Task 4 React Native | Restaurant App](https://www.figma.com/design/7ZIf4538aPzLMJQz82od2P/Task4-React-Native%7C-Restaurant-App?node-id=3-36&t=D1ASR63LK1hkGx6m-1)**

Use this file for layout, components, and visual reference when building or updating the app.

---

## Prerequisites

- **Node.js** v18 or higher ([nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- **Supabase account** ([supabase.com](https://supabase.com))
- For mobile: **Expo Go** on your device, or **Android Studio** / **Xcode** for emulators

---

## 1. Running the mobile app (React Native / Expo)

The app is in the **project root**. It uses Expo and Expo Router.

### Install dependencies

From the project root:

```bash
npm install
```

### Configure Supabase

1. Create a project at [Supabase](https://supabase.com).
2. In the dashboard: **Project Settings → API** copy:
   - **Project URL**
   - **anon public** key
3. Put them in **`lib/supabase.ts`**:

   - `SUPABASE_URL` = your Project URL  
   - `SUPABASE_ANON_KEY` = your anon key  

### Database (one-time)

In the Supabase **SQL Editor**, run (in order if needed):

- **`supabase-profiles-auth-trigger.sql`** – profiles table + trigger for new users  
- **`supabase-featured-and-customers.sql`** – featured dishes + customer fields  
- Any other SQL files referenced in the repo (e.g. orders, food_items, RLS)

### Start the app

From the **project root**:

```bash
npm start
```

Or:

```bash
npx expo start
```

Then:

- **Web:** press `w` (or open the URL shown in the terminal).
- **Android:** press `a` (emulator) or scan the QR code with Expo Go.
- **iOS:** press `i` (simulator) or scan the QR code with the Camera app (Expo Go).

### Other npm scripts (project root)

| Command           | Description                |
|------------------|----------------------------|
| `npm start`      | Start Expo dev server      |
| `npm run android`| Start and open Android     |
| `npm run ios`    | Start and open iOS         |
| `npm run web`    | Start and open in browser  |

---

## 2. Running the CMS (web admin)

The CMS is a separate **Vite + React** app in the **`cms`** folder. It is used to manage food items, orders, and customers.

### Install dependencies

From the project root, go into the CMS folder and install:

```bash
cd cms
npm install
```

### Configure Supabase (CMS)

Use the **same** Supabase project as the app.

1. In **`cms/src/lib/supabase.ts`** set:
   - Same **Project URL** and **anon key** as the app  
2. Ensure your Supabase project has:
   - The tables and RLS from the SQL scripts (profiles, orders, food_items, etc.)
   - At least one user with **`is_admin = true`** in the **profiles** table (for CMS login)

### Start the CMS

From the **`cms`** folder:

```bash
npm run dev
```

Then open the URL shown in the terminal (e.g. `http://localhost:5173`).

### CMS admin login

- The CMS uses **Supabase Auth**: log in with an account that has **`is_admin = true`** in the **profiles** table.
- To give a user admin rights: **Supabase** → **Table Editor** → **profiles** → find the user row → set **`is_admin`** to **`true`** → Save.

**Admin credentials (this repo is private):**

| Field    | Value                        |
|---------|------------------------------|
| Email   | sithomolamusiki@gmail.com    |
| Password| Mlab@1234                    |

### CMS scripts (from `cms/`)

| Command            | Description           |
|--------------------|-----------------------|
| `npm run dev`      | Start dev server      |
| `npm run build`    | Production build      |
| `npm run preview`  | Preview production build |

---

## Hosting the CMS on Vercel

1. **Push your code** to GitHub (this repo).

2. **Go to [vercel.com](https://vercel.com)** → Sign in → **Add New** → **Project**.

3. **Import** your repository. If the repo has both the app and the CMS, set:
   - **Root Directory**: click **Edit** → set to **`cms`** (so Vercel builds only the CMS).
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment variables** (optional but recommended for production):
   - **Settings** → **Environment Variables**
   - Add:
     - **Name:** `VITE_SUPABASE_URL` → **Value:** your Supabase project URL  
     - **Name:** `VITE_SUPABASE_ANON_KEY` → **Value:** your Supabase anon key  
   - If you don’t set these, the CMS uses the fallback values in `cms/src/lib/supabase.ts`.

5. **Deploy**: click **Deploy**. Vercel will build and give you a URL (e.g. `your-cms.vercel.app`).

6. **SPA routing**: `cms/vercel.json` is set so routes like `/dashboard` and `/login` work on refresh and direct links.

---

## Quick reference

| What        | Where to run   | Command        |
|------------|----------------|----------------|
| Mobile app | Project root   | `npm start`    |
| CMS        | `cms/` folder  | `npm run dev`  |

---

## Project layout (summary)

```
Restaurant-App/
├── app/                    # Expo Router app (mobile + web)
├── cms/                    # CMS web app (Vite + React)
│   └── vercel.json         # Vercel SPA rewrites (for hosting on Vercel)
├── lib/supabase.ts         # App Supabase config
├── cms/src/lib/supabase.ts # CMS Supabase config (uses VITE_* env vars on Vercel)
├── supabase-profiles-auth-trigger.sql
├── supabase-featured-and-customers.sql
├── README.md
└── DOCUMENTATION.md        # This file
```

For full app structure, features, and setup details, see **README.md**.
