-- Fix 1: Make ionutbaltag3@gmail.com an ADMIN
UPDATE user_profiles 
SET role = 'admin',
    credits_balance = 1000
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'ionutbaltag3@gmail.com'
);

-- If role column doesn't exist, add it
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Verify it worked
SELECT 
  up.user_id,
  au.email,
  up.role,
  up.credits_balance
FROM user_profiles up
JOIN auth.users au ON au.id::text = up.user_id
WHERE au.email = 'ionutbaltag3@gmail.com';

-- Fix 2: Check why ads aren't displaying
-- First, let's see if ads exist
SELECT id, title, status, images, created_at
FROM anunturi
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policies on anunturi
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'anunturi'
ORDER BY policyname;
