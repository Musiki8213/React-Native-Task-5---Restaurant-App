-- Add payment-related columns to orders table for Paystack integration
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add index for payment reference lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);

-- Update existing orders to have 'pending' payment status if null
UPDATE orders SET payment_status = 'pending' WHERE payment_status IS NULL;
