-- Migrate your existing orders table to match what the app expects
-- Your table has: id, user_id, total_amount, status, delivery_address, created_at
-- The app expects: id, user_id, total, address, items, status, payment_reference, payment_status, created_at

-- 1. Add missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- 2. Rename columns to match the app (run only once; skip if you already renamed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
    ALTER TABLE orders RENAME COLUMN total_amount TO total;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
    ALTER TABLE orders RENAME COLUMN delivery_address TO address;
  END IF;
END $$;

-- 3. Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);

-- 4. Backfill items for existing rows so they're not null
UPDATE orders SET items = '[]'::jsonb WHERE items IS NULL;
