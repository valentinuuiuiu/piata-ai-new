-- ==========================================
-- Check New Database Schema
-- ==========================================
-- Run this in NEW Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new

-- 1. LIST ALL TABLES
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. CHECK IF KEY TABLES EXIST
SELECT
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories')
    THEN '✅ categories exists'
    ELSE '❌ categories missing'
  END as categories_status,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subcategories')
    THEN '✅ subcategories exists'
    ELSE '❌ subcategories missing'
  END as subcategories_status,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles')
    THEN '✅ profiles exists'
    ELSE '❌ profiles missing'
  END as profiles_status;

-- 3. COUNT ROWS IN EACH TABLE (if they exist)
-- Categories
SELECT 'categories' as table_name, COUNT(*) as row_count FROM categories
UNION ALL
SELECT 'subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- 4. SHOW CATEGORIES (if exists)
SELECT * FROM categories LIMIT 10;

-- 5. SHOW SUBCATEGORIES (if exists)
SELECT * FROM subcategories LIMIT 10;

-- 6. SHOW TABLE STRUCTURES
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'subcategories', 'profiles')
ORDER BY table_name, ordinal_position;
