-- ==============================================================
-- COMPLETE FIX FOR IONUT'S ACCOUNT
-- ==============================================================

-- 1. Add role column if missing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Make ionutbaltag3@gmail.com an ADMIN with 1000 credits
UPDATE user_profiles 
SET 
  role = 'admin',
  credits_balance = 1000,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id::text FROM auth.users WHERE email = 'ionutbaltag3@gmail.com'
);

-- 3. If profile doesn't exist, create it
INSERT INTO user_profiles (user_id, role, credits_balance, full_name)
SELECT 
  id::text,
  'admin',
  1000,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE email = 'ionutbaltag3@gmail.com'
AND id::text NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  credits_balance = 1000;

-- 4. Fix anunturi status (make sure posted ads are 'active')
UPDATE anunturi
SET status = 'active'
WHERE status IS NULL OR status = '';

-- 5. Verify the fix
SELECT 
  au.id as user_id,
  au.email,
  up.role,
  up.credits_balance,
  up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id::text = up.user_id
WHERE au.email = 'ionutbaltag3@gmail.com';

-- 6. Show recent ads to verify they exist
SELECT 
  id,
  title,
  status,
  user_id,
  CASE 
    WHEN images IS NOT NULL THEN jsonb_array_length(images::jsonb)
    ELSE 0
  END as image_count,
  created_at
FROM anunturi
ORDER BY created_at DESC
LIMIT 5;

-- Success message
SELECT '✅ IONUT IS NOW ADMIN WITH 1000 CREDITS!' as message;
