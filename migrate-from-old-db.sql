-- ==========================================
-- Migration Script: Old DB → New DB
-- SUBCATEGORIES ONLY
-- ==========================================
-- Run this in your NEW Supabase database SQL Editor

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

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Public Read)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Subcategories are viewable by everyone" ON subcategories
  FOR SELECT USING (true);

-- 5. INSERT DEFAULT CATEGORIES
INSERT INTO categories (name, slug, icon) VALUES
  ('Auto', 'auto', '🚗'),
  ('Imobiliare', 'imobiliare', '🏠'),
  ('Electronice', 'electronice', '📱'),
  ('Moda', 'moda', '👕'),
  ('Casa & Gradina', 'casa-gradina', '🏡')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- DONE!
-- ==========================================
-- Now copy subcategories data from old DB:

-- 1. Go to OLD database: https://supabase.com/dashboard/project/oikhfoaltormcigauobs
-- 2. Run this query to get your subcategories:
--    SELECT * FROM subcategories ORDER BY category_id, id;
-- 3. Copy the results and insert them into the NEW database

-- Example insert (replace with your actual data):
-- INSERT INTO subcategories (category_id, name) VALUES
--   (1, 'Autoturisme'),
--   (1, 'Utilaje'),
--   (1, 'Piese auto'),
--   (2, 'Apartamente'),
--   (2, 'Case/Vile'),
--   (3, 'Telefoane'),
--   (3, 'Laptop-uri');

-- ==========================================
-- That's it! Your subcategories are ready.
-- ==========================================
