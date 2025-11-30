-- ============================================
-- COMPLETE SUPABASE STORAGE FIX FOR PIATA AI RO
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Ensure the listings bucket exists and is PUBLIC
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection)
VALUES (
  'listings', 
  'listings', 
  true,  -- IMPORTANT: Set to true for public access
  10485760, -- 10MB per file (increased from 5MB)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  false
) ON CONFLICT (id) DO UPDATE SET
  public = true,  -- Make sure it's public
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Step 2: Drop ALL existing policies on storage.objects
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname LIKE '%listing%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Create SIMPLE and PERMISSIVE policies

-- Allow anyone (authenticated or not) to upload to listings bucket
CREATE POLICY "Anyone can upload to listings"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'listings');

-- Allow anyone to read from listings bucket
CREATE POLICY "Anyone can read from listings"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listings');

-- Allow authenticated users to update files in listings bucket
CREATE POLICY "Authenticated can update listings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listings')
WITH CHECK (bucket_id = 'listings');

-- Allow authenticated users to delete from listings bucket
CREATE POLICY "Authenticated can delete listings"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listings');

-- Step 4: Grant necessary permissions
GRANT ALL ON storage.buckets TO postgres, anon, authenticated, service_role;
GRANT ALL ON storage.objects TO postgres, anon, authenticated, service_role;

-- Step 5: Check anunturi table and ensure proper structure
DO $$ 
BEGIN
    -- Add images column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'anunturi' AND column_name = 'images'
    ) THEN
        ALTER TABLE anunturi ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Ensure user_id is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'anunturi' AND column_name = 'user_id'
    ) THEN
        -- Check if it's not already UUID
        IF (SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'anunturi' AND column_name = 'user_id') != 'uuid' 
        THEN
            ALTER TABLE anunturi ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        END IF;
    END IF;
END $$;

-- Step 6: Drop existing RLS policies on anunturi
DROP POLICY IF EXISTS "Users can view own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can insert own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can update own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can delete own listings" ON anunturi;
DROP POLICY IF EXISTS "Admins full access to listings" ON anunturi;
DROP POLICY IF EXISTS "Public can view active listings" ON anunturi;
DROP POLICY IF EXISTS "Anyone can view active listings" ON anunturi;

-- Step 7: Create proper RLS policies for anunturi table

-- Allow anyone to view active listings
CREATE POLICY "Anyone can view active listings"
ON anunturi
FOR SELECT
TO public
USING (status = 'active' OR status = 'pending' OR status = 'pending_ai');

-- Allow authenticated users to view their own listings (any status)
CREATE POLICY "Users can view own listings"
ON anunturi
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own listings
CREATE POLICY "Users can insert own listings"
ON anunturi
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own listings
CREATE POLICY "Users can update own listings"
ON anunturi
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own listings
CREATE POLICY "Users can delete own listings"
ON anunturi
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on anunturi table
ALTER TABLE anunturi ENABLE ROW LEVEL SECURITY;

-- Step 8: Grant permissions on anunturi table
GRANT ALL ON anunturi TO postgres, authenticated, service_role;
GRANT SELECT ON anunturi TO anon;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check storage bucket
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'listings';

-- Check storage policies
SELECT 
    policyname,
    cmd,
    roles::text[],
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%listing%'
ORDER BY policyname;

-- Check anunturi table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'anunturi'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check anunturi RLS policies
SELECT 
    policyname,
    cmd,
    roles::text[]
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'anunturi'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'anunturi';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Storage bucket and policies have been configured successfully!';
    RAISE NOTICE '✅ Anunturi table RLS policies have been updated!';
    RAISE NOTICE '📸 You can now upload images to the listings bucket!';
    RAISE NOTICE '🔗 Images will be publicly accessible via URL!';
END $$;
