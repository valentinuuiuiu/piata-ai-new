-- Fix Missing Tables for Checkout & User Management
-- Run this in Supabase SQL Editor

-- 1. Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- 2. Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'spend', 'refund', 'bonus'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  package_id INTEGER REFERENCES credit_packages(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_session ON credit_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- 3. Add email column to user_profiles if missing
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 4. Create shopping_cart table
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES anunturi(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_listing_id ON shopping_cart(listing_id);

-- 5. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  shipping_address JSONB,
  billing_address JSONB,
  items JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 6. Enable RLS on new tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies

-- User Credits Policies
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Credit Transactions Policies
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions" ON credit_transactions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Shopping Cart Policies
CREATE POLICY "Users can manage own cart" ON shopping_cart
  FOR ALL USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" ON orders
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 8. Create function to update user credits
CREATE OR REPLACE FUNCTION update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id VARCHAR DEFAULT NULL,
  p_package_id INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Ensure user has a credits record
  INSERT INTO user_credits (user_id, credits)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update credits
  UPDATE user_credits
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    status,
    description,
    stripe_session_id,
    package_id
  ) VALUES (
    p_user_id,
    p_amount,
    p_transaction_type,
    'completed',
    p_description,
    p_stripe_session_id,
    p_package_id
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- 9. Create function to spend credits
CREATE OR REPLACE FUNCTION spend_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT credits INTO v_current_balance
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'current_balance', COALESCE(v_current_balance, 0)
    );
  END IF;

  -- Deduct credits
  UPDATE user_credits
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    status,
    description
  ) VALUES (
    p_user_id,
    -p_amount,
    'spend',
    'completed',
    p_description
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- 10. Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_number VARCHAR(50);
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = v_order_number) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_order_number;
END;
$$;

-- 11. Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- 12. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_transactions_updated_at BEFORE UPDATE ON credit_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Grant permissions
GRANT ALL ON user_credits TO authenticated, service_role;
GRANT ALL ON credit_transactions TO authenticated, service_role;
GRANT ALL ON shopping_cart TO authenticated, service_role;
GRANT ALL ON orders TO authenticated, service_role;

-- 14. Insert sample data for testing (optional)
-- Create a test user credit record if you have a test user
-- INSERT INTO user_credits (user_id, credits) VALUES ('your-test-user-id', 100);

-- 15. Create views for analytics
CREATE OR REPLACE VIEW credit_balance_summary AS
SELECT 
  uc.user_id,
  uc.credits as current_balance,
  COUNT(ct.id) as total_transactions,
  SUM(CASE WHEN ct.transaction_type = 'purchase' THEN ct.amount ELSE 0 END) as total_purchased,
  SUM(CASE WHEN ct.transaction_type = 'spend' THEN ABS(ct.amount) ELSE 0 END) as total_spent,
  uc.created_at as member_since,
  uc.updated_at as last_activity
FROM user_credits uc
LEFT JOIN credit_transactions ct ON ct.user_id = uc.user_id
GROUP BY uc.user_id, uc.credits, uc.created_at, uc.updated_at;

-- Grant view access
GRANT SELECT ON credit_balance_summary TO authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE user_credits IS 'Stores user credit balances';
COMMENT ON TABLE credit_transactions IS 'Tracks all credit purchases and spending';
COMMENT ON TABLE shopping_cart IS 'User shopping cart for listings';
COMMENT ON TABLE orders IS 'Order history and tracking';
COMMENT ON FUNCTION update_user_credits IS 'Add credits to user account (purchases, bonuses)';
COMMENT ON FUNCTION spend_user_credits IS 'Deduct credits from user account (spending)';

-- Success message
SELECT 'Checkout & Cart Tables Created Successfully! ✅' as status;
