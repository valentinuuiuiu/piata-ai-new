-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR NOW!
-- ============================================
-- Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new
-- Copy this ENTIRE file and paste it there, then click RUN
-- ============================================

-- Step 1: Create the listings bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection)
VALUES (
  'listings', 
  'listings', 
  true,  -- IMPORTANT: PUBLIC bucket
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  false
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload to listings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read from listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete listings" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Step 3: Create storage policies

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Allow anyone to read/view images (PUBLIC)
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listings');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listings')
WITH CHECK (bucket_id = 'listings');

-- Allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listings');

-- Step 4: Grant permissions
GRANT ALL ON storage.buckets TO postgres, anon, authenticated, service_role;
GRANT ALL ON storage.objects TO postgres, anon, authenticated, service_role;

-- Step 5: Check anunturi table
DO $$ 
BEGIN
    -- Add images column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'anunturi' AND column_name = 'images'
    ) THEN
        ALTER TABLE anunturi ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Step 6: Fix anunturi RLS policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON anunturi;
DROP POLICY IF EXISTS "Users can view own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can insert own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can update own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can delete own listings" ON anunturi;
DROP POLICY IF EXISTS "Public can view active" ON anunturi;

-- Allow anyone to view active listings
CREATE POLICY "Public can view active"
ON anunturi
FOR SELECT
TO public
USING (status IN ('active', 'pending', 'pending_ai'));

-- Allow authenticated users to view their own (any status)
CREATE POLICY "Users view own"
ON anunturi
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert
CREATE POLICY "Users can insert"
ON anunturi
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own
CREATE POLICY "Users can update"
ON anunturi
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own
CREATE POLICY "Users can delete"
ON anunturi
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE anunturi ENABLE ROW LEVEL SECURITY;

-- Step 7: Grant permissions
GRANT ALL ON anunturi TO postgres, authenticated, service_role;
GRANT SELECT ON anunturi TO anon;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check bucket
SELECT 
    id, 
    name, 
    public,
    file_size_limit / 1024 / 1024 as size_limit_mb,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'listings';

-- Check storage policies
SELECT 
    policyname,
    cmd,
    roles::text[]
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%upload%' OR policyname LIKE '%view%' OR policyname LIKE '%update%' OR policyname LIKE '%delete%'
ORDER BY policyname;

-- Check anunturi policies  
SELECT 
    policyname,
    cmd,
    roles::text[]
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'anunturi'
ORDER BY policyname;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Setup complete!';
    RAISE NOTICE '✅ Bucket "listings" is PUBLIC';
    RAISE NOTICE '✅ Storage policies configured';
    RAISE NOTICE '✅ Anunturi table policies configured';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next: Test with node tmp_rovodev_test_complete_flow.js';
END $$;
