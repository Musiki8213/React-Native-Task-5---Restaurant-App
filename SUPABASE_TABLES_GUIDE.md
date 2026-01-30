# Supabase Tables Required for This App

Run the SQL below in the **Supabase Dashboard → SQL Editor** in this order. Supabase already provides `auth.users`; you only create the **public** tables and policies below.

---

## Auth-first profiles (recommended)

**Use `supabase-profiles-auth-trigger.sql`** for the correct setup:

- **Supabase Auth (`auth.users`) is the source of truth** for email and password.
- **The app must NOT insert into `profiles`.** A database trigger creates a profile row when a new user is inserted into `auth.users`.
- **`profiles.id`** must match `auth.users.id`.
- After signup or login, the app **updates** the existing profile row (e.g. `full_name`, `phone`, `address`) with `.update().eq('id', user.id)`.

That script defines the `profiles` table (with `full_name`, `phone`, `email`, `address`, `is_admin`, `is_active`, optional card fields), the trigger, and RLS (SELECT + UPDATE only; no INSERT from the app).

---

## 1. Core tables (create first)

### **profiles** (legacy / fallback)

If you are not using `supabase-profiles-auth-trigger.sql`, you can create `profiles` manually. The app expects columns: `id` (PK ref `auth.users`), `email`, `full_name`, `phone`, `address`, `is_admin`, `is_active`, and optionally `card_name`, `card_number`, `card_expiry`, `card_cvc`, `name`, `contact` for backward compatibility.

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- No INSERT policy: profile rows are created by trigger on auth.users (see supabase-profiles-auth-trigger.sql).
```

---

### **orders**
Stores customer orders. Used by the app (checkout, orders tab) and CMS (order management, analytics).

```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  address TEXT NOT NULL,
  card_number TEXT,
  card_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### **payments** (optional)

You do **not** need this for the app to work. Payment is already tracked on **orders** via `payment_reference` and `payment_status`. Add a **payments** table only if you want:

- An audit trail of every payment attempt (failed, retried, succeeded)
- To store Paystack response data for support or disputes
- To support refunds, partial payments, or multiple payments per order later

If you add it, link each row to an order and optionally store the gateway reference and status:

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  gateway TEXT DEFAULT 'paystack',
  gateway_reference TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_reference ON payments(gateway_reference);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins: add SELECT/UPDATE policies if you want CMS to see payments (same pattern as orders).
```

Then in your app, when you verify a Paystack payment and before/after creating the order, insert a row into **payments**. The app currently does **not** use this table; you’d add that logic if you create the table.

---

### **categories**
Used by the CMS and the mobile app to group food items (Starters, Burgers, Mains, etc.).

```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Default categories
INSERT INTO categories (name) VALUES 
  ('Starters'), ('Burgers'), ('Mains'), ('Desserts'), ('Beverages'), ('Alcohol')
ON CONFLICT (name) DO NOTHING;
```

---

### **food_items**
Menu items. Used by the app (home, category, item detail, cart) and CMS (add/edit/delete, dashboard analytics).

```sql
CREATE TABLE IF NOT EXISTS food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  category_id UUID REFERENCES categories(id),
  rating INTEGER DEFAULT 5,
  sides JSONB,
  drinks JSONB,
  extras JSONB,
  optional_ingredients JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view food items" ON food_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert food items" ON food_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins can update food items" ON food_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins can delete food items" ON food_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
```

---

### **restaurant_info** (optional)
Used if you show restaurant details somewhere. Not required for core flows.

```sql
CREATE TABLE IF NOT EXISTS restaurant_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  contact TEXT,
  email TEXT,
  opening_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE restaurant_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view restaurant info" ON restaurant_info FOR SELECT USING (true);
CREATE POLICY "Admins can manage restaurant info" ON restaurant_info FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
```

---

## 2. CMS: admin access to orders and profiles

Run after the tables above exist (e.g. from `cms-admin-orders-customers.sql` or the following):

```sql
-- Admins can view and update all orders
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Admins can view and update all profiles (e.g. customer list, disabled_flag)
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
```

---

## 3. Auto-create profile on signup (recommended)

So every new auth user gets a row in `profiles`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin, name, contact, address, card_name, card_number, card_expiry, card_cvc)
  VALUES (NEW.id, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Storage bucket (for food images)

- In Supabase: **Storage → New bucket**.
- Name: `food-images`.
- Make it **Public** so the app can show image URLs.

No extra tables are required for storage.

---

## Summary: tables you need

| Table             | Required? | Purpose                                      |
|-------------------|-----------|----------------------------------------------|
| **profiles**      | Yes       | User profile, admin flag, customer list (CMS)|
| **orders**        | Yes       | Orders, payment ref/status, analytics        |
| **categories**    | Yes       | Menu categories for CMS and app              |
| **food_items**    | Yes       | Menu items                                   |
| **restaurant_info** | No      | Optional restaurant details                  |
| **payments**      | No        | Optional audit of payment attempts (Paystack)|

**Storage:** one bucket, `food-images`, public.

**Auth:** Supabase Auth (`auth.users`) is provided by Supabase; you only add `profiles` and link it to `auth.users(id)`.

After creating these tables and policies, the app and CMS can run as designed. To make a user an admin, set `profiles.is_admin = true` for that user’s row in the SQL Editor or Table Editor.
