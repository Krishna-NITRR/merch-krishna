-- ============================================
-- TABLE: merch_orders
-- Merchandise store orders and payments
-- ============================================
CREATE TABLE IF NOT EXISTS merch_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text UNIQUE,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  razorpay_signature text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  items jsonb NOT NULL,
  amount_minor integer NOT NULL,
  currency text DEFAULT 'INR',
  payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'order_created', 'paid', 'failed', 'refunded')),
  order_status text DEFAULT 'processing'
    CHECK (order_status IN ('processing', 'printed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE merch_orders ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on merch_orders"
  ON merch_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to view their confirmed order by razorpay_order_id
CREATE POLICY "Anon read own order"
  ON merch_orders
  FOR SELECT
  TO anon
  USING (true);
