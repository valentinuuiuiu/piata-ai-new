-- Referral System Migration
-- Create tables for referral tracking and rewards

-- Referral Codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals Tracking
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'fraud_detected'
  tier INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id BIGSERIAL PRIMARY KEY,
  referral_id BIGINT REFERENCES referrals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type VARCHAR(50) NOT NULL, -- 'credit', 'discount', 'premium_trial', 'cash'
  amount DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'distributed', 'cancelled'
  distributed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Fraud Logs
CREATE TABLE IF NOT EXISTS referral_fraud_logs (
  id BIGSERIAL PRIMARY KEY,
  referral_id BIGINT REFERENCES referrals(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS referral_codes_user_idx ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes(code);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_idx ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS referral_rewards_user_idx ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS referral_rewards_status_idx ON referral_rewards(status);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_fraud_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral code
CREATE POLICY "Users can view own referral code"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view referrals they made
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access referral_codes" ON referral_codes FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access referrals" ON referrals FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access referral_rewards" ON referral_rewards FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access referral_fraud_logs" ON referral_fraud_logs FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Check if user already has a code
  SELECT code INTO v_code FROM referral_codes WHERE user_id = p_user_id;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  -- Generate new code until unique
  LOOP
    v_code := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code);
  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically generate referral code on user creation (if needed)
-- For now we'll call it manually or via API to save resources
