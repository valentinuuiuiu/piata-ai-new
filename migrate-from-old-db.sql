-- ==========================================
-- Migration Script: Old DB → New DB
-- ==========================================
-- Run this in your NEW Supabase database SQL Editor
-- This will create the tables from the old DB

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. SUBCATEGORIES TABLE (from old DB)
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. USERS TABLE (compatible with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Matches Supabase Auth UUID
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255), -- Optional now with Supabase Auth
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. USER PROFILES (for credits balance)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. ANUNTURI (LISTINGS) TABLE
CREATE TABLE IF NOT EXISTS anunturi (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2),
  location VARCHAR(255),
  phone VARCHAR(20),
  images JSONB,
  status VARCHAR(20) DEFAULT 'active',
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. CREDIT PACKAGES TABLE
CREATE TABLE IF NOT EXISTS credit_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stripe_price_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
);

-- 7. CREDITS TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS credits_transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  package_id INTEGER REFERENCES credit_packages(id),
  credits_amount INTEGER NOT NULL,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  amount_eur DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. LISTING BOOSTS TABLE
CREATE TABLE IF NOT EXISTS listing_boosts (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES anunturi(id) ON DELETE CASCADE NOT NULL,
  boost_type VARCHAR(20) NOT NULL,
  starts_at TIMESTAMP DEFAULT NOW(),
  duration_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_repost BOOLEAN DEFAULT FALSE,
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. ENABLE ROW LEVEL SECURITY
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anunturi ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;

-- 10. CREATE POLICIES (Allow public read, authenticated write)
-- Categories - Public Read
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Subcategories - Public Read
CREATE POLICY "Subcategories are viewable by everyone" ON subcategories
  FOR SELECT USING (true);

-- Anunturi - Public Read, Owner Write
CREATE POLICY "Anunturi are viewable by everyone" ON anunturi
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own anunturi" ON anunturi
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own anunturi" ON anunturi
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own anunturi" ON anunturi
  FOR DELETE USING (auth.uid()::text = user_id);

-- User Profiles - Users can only see/update their own
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Credit Packages - Public Read
CREATE POLICY "Credit packages are viewable by everyone" ON credit_packages
  FOR SELECT USING (true);

-- Credits Transactions - Users can only see their own
CREATE POLICY "Users can view their own transactions" ON credits_transactions
  FOR SELECT USING (auth.uid()::text = user_id);

-- 11. INSERT DEFAULT CATEGORIES (if needed)
INSERT INTO categories (name, slug, icon) VALUES
  ('Auto', 'auto', '🚗'),
  ('Imobiliare', 'imobiliare', '🏠'),
  ('Electronice', 'electronice', '📱'),
  ('Moda', 'moda', '👕'),
  ('Casa & Gradina', 'casa-gradina', '🏡')
ON CONFLICT (slug) DO NOTHING;

-- 12. INSERT DEFAULT CREDIT PACKAGES
INSERT INTO credit_packages (name, credits, price, is_active) VALUES
  ('Starter Pack', 10, 9.99, true),
  ('Popular Pack', 50, 39.99, true),
  ('Pro Pack', 100, 69.99, true),
  ('Business Pack', 500, 299.99, true)
ON CONFLICT DO NOTHING;

-- Done! Now you need to manually copy data from old DB if needed
