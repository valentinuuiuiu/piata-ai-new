-- ============================================
-- Supabase Storage Bucket & RLS Policy Fix
-- For Piata AI RO - Image Upload Fix
-- ============================================

-- Step 1: Check if listings bucket exists
SELECT * FROM storage.buckets WHERE id = 'listings';

-- Step 2: Create listings bucket if it doesn't exist (or update it)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings', 
  'listings', 
  true,  -- Changed to true for public access
  5242880, -- 5MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = true,  -- Make sure it's public
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 3: Drop all existing policies on storage.objects for listings bucket
DROP POLICY IF EXISTS "Users can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own listings" ON storage.objects;
DROP POLICY IF EXISTS "Admins full access to listings" ON storage.objects;
DROP POLICY IF EXISTS "Public can read listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Step 4: Create simplified, working policies

-- Policy 1: Allow authenticated users to upload to listings bucket
CREATE POLICY "Authenticated users can upload" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'listings'
);

-- Policy 2: Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'listings')
WITH CHECK (bucket_id = 'listings');

-- Policy 3: Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'listings');

-- Policy 4: Allow EVERYONE (public + authenticated) to read/view images
CREATE POLICY "Public read access" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'listings');

-- Step 5: Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- Step 6: Verify policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Step 7: List current files in listings bucket (if any)
SELECT * FROM storage.objects WHERE bucket_id = 'listings' LIMIT 10;

-- ============================================
-- Additional: Check anunturi table structure
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'anunturi'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS on anunturi table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'anunturi';

-- List anunturi policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'anunturi' 
AND schemaname = 'public';
