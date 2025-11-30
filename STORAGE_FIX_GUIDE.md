# 🖼️ Supabase Storage Fix Guide - Piata AI RO

## ❌ Problem Detected
The test shows: **"Bucket not found"** - The `listings` storage bucket doesn't exist in your Supabase project!

## ✅ Solution - Follow These Steps

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project: `ndzoavaveppnclkujjhh`
3. Go to **Storage** in the left sidebar

### Step 2: Create the Bucket (Option A - UI Method)
1. Click **"New bucket"**
2. Enter these settings:
   - **Name**: `listings`
   - **Public bucket**: ✅ **CHECK THIS BOX** (Important!)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`
3. Click **"Create bucket"**

### Step 3: OR Use SQL Method (Option B - Recommended)
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy and paste the entire content from: `tmp_rovodev_complete_fix.sql`
4. Click **"Run"**
5. Check for success messages at the bottom

### Step 4: Set Storage Policies
After creating the bucket, you need to set the right policies:

#### Go to Storage > Policies
1. Click on the `listings` bucket
2. Click **"New Policy"**
3. Create these 4 policies:

**Policy 1: Public Read Access**
- Name: `Public read access`
- Operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'listings'`

**Policy 2: Authenticated Upload**
- Name: `Authenticated users can upload`
- Operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'listings'`

**Policy 3: Authenticated Update**
- Name: `Authenticated users can update`
- Operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'listings'`
- WITH CHECK expression: `bucket_id = 'listings'`

**Policy 4: Authenticated Delete**
- Name: `Authenticated users can delete`
- Operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'listings'`

### Step 5: Get Your Service Role Key
1. Go to **Settings** > **API** in Supabase dashboard
2. Find **"service_role"** key (⚠️ NOT the anon key!)
3. Click **"Reveal"** and copy it
4. Add to your `.env.local` file:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
   ```

### Step 6: Verify the Fix
Run this command to test:
```bash
node tmp_rovodev_test_complete_flow.js
```

You should see:
- ✅ Listings bucket exists
- ✅ Upload test successful
- ✅ Public URL accessible

### Step 7: Test in Browser
1. Open `tmp_rovodev_test_upload.html` in your browser
2. Select an image
3. Click **"Test Upload"**
4. You should see the image uploaded and displayed!

### Step 8: Test the Full App
1. Start your dev server: `npm run dev`
2. Go to: http://localhost:3000/autentificare
3. Log in or create an account
4. Go to: http://localhost:3000/postare
5. Fill in the form with 3-4 images
6. Click **"Publică Anunțul ACUM!"**
7. Should see: "Anunț creat cu succes!"

## 🔧 If You Still Have Issues

### Issue: "RLS policy violation"
**Solution**: Make sure you're logged in when posting. The user_id must match auth.uid()

### Issue: "Image upload failed"
**Solution**: 
1. Check file size (max 10MB)
2. Check file type (only images allowed)
3. Verify bucket is public
4. Check browser console for errors

### Issue: "Service role key not found"
**Solution**: Add SUPABASE_SERVICE_ROLE_KEY to .env.local (see Step 5)

### Issue: Images not displaying
**Solution**: 
1. Check bucket is PUBLIC
2. Test public URL directly in browser
3. Verify images array is stored in database

## 📝 Quick Checklist
- [ ] Listings bucket created in Supabase
- [ ] Bucket is set to PUBLIC
- [ ] 4 storage policies created (or SQL script run)
- [ ] Service role key added to .env.local
- [ ] Test script passes (all ✅)
- [ ] Can upload images via test HTML
- [ ] Can post ads with images in the app

## 🎯 Expected Database Structure

Your `anunturi` table should have:
- `id` (bigint, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `title` (text)
- `description` (text)
- `price` (numeric)
- `category_id` (bigint)
- `subcategory_id` (bigint, nullable)
- `location` (text)
- `phone` (text)
- `images` (jsonb) - Array of image URLs
- `status` (text) - 'pending_ai', 'active', 'inactive'
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🚀 After Fixing

Once everything works:
1. Delete test files:
   ```bash
   rm tmp_rovodev_*.js tmp_rovodev_*.sql tmp_rovodev_*.html
   ```
2. Commit your .env.local changes (but don't commit the file itself!)
3. Deploy to Vercel if needed

## 📞 Need Help?
If you're still stuck, check:
1. Supabase logs: Dashboard > Logs
2. Browser console: F12 > Console tab
3. Network tab: F12 > Network tab (check API calls)

Good luck! 🎉
