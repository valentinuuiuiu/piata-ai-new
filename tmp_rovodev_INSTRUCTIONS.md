# 🎯 COMPLETE SETUP INSTRUCTIONS FOR PIATA AI RO

## Current Status: ❌ Storage Bucket Not Found

Your Supabase project is missing the `listings` storage bucket. This is why image uploads fail.

---

## 🚨 CRITICAL: Do These Steps IN ORDER

### ✅ STEP 1: Add Service Role Key to .env.local

1. **Open this link** (it will log you into your Supabase project):
   ```
   https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api
   ```

2. **Find the "service_role" section** (NOT "anon public")

3. **Click "Reveal"** next to service_role key

4. **Copy the entire key** (starts with `eyJ...`)

5. **Edit `.env.local`** in your project root:
   ```bash
   nano .env.local
   # or
   code .env.local
   ```

6. **Replace this line**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here-get-from-supabase-dashboard
   ```
   
   With:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...YOUR_ACTUAL_KEY
   ```

7. **Save the file**

---

### ✅ STEP 2: Create Storage Bucket in Supabase

#### Option A: Use SQL Script (RECOMMENDED - Easiest)

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new
   ```

2. **Copy the ENTIRE content** from: `tmp_rovodev_complete_fix.sql`

3. **Paste it** into the SQL editor

4. **Click "Run"** button (bottom right)

5. **Wait for completion** - you should see success messages:
   ```
   ✅ Storage bucket and policies have been configured successfully!
   ✅ Anunturi table RLS policies have been updated!
   📸 You can now upload images to the listings bucket!
   ```

6. **Done!** Skip to Step 3.

#### Option B: Manual UI Method (Alternative)

1. **Go to Storage**:
   ```
   https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/storage/buckets
   ```

2. **Click "New bucket"** button

3. **Enter these settings**:
   - Name: `listings`
   - ✅ **IMPORTANT: Check "Public bucket"** 
   - File size limit: `10 MB`
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

4. **Click "Create bucket"**

5. **Now add policies**:
   - Click on the `listings` bucket
   - Click "New Policy" (top right)
   - Select "For full customization"
   
   **Create 4 policies:**

   a. **Public Read Policy**:
   - Policy name: `Public read access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'listings'`
   - Click "Review" > "Save policy"

   b. **Authenticated Upload Policy**:
   - Policy name: `Authenticated users can upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'listings'`
   - Click "Review" > "Save policy"

   c. **Authenticated Update Policy**:
   - Policy name: `Authenticated users can update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'listings'`
   - WITH CHECK expression: `bucket_id = 'listings'`
   - Click "Review" > "Save policy"

   d. **Authenticated Delete Policy**:
   - Policy name: `Authenticated users can delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'listings'`
   - Click "Review" > "Save policy"

---

### ✅ STEP 3: Verify Everything Works

Run the test script:

```bash
node tmp_rovodev_test_complete_flow.js
```

**Expected output:**
```
✅ Connected to Supabase
✅ Listings bucket exists
✅ Upload test successful!
✅ Found X listings
```

**If you see errors**, go back and check:
- Service role key is correct in .env.local
- Bucket is created and set to PUBLIC
- All 4 policies are created

---

### ✅ STEP 4: Test in Browser

1. **Open the test page**:
   ```bash
   # Option 1: Open directly
   open tmp_rovodev_test_upload.html
   
   # Option 2: Or just double-click the file
   ```

2. **Select an image** (any image, under 10MB)

3. **Click "Test Upload"**

4. **You should see**:
   - "✅ Upload successful!"
   - Your image displayed on the page
   - A public URL shown

---

### ✅ STEP 5: Test the Full Application

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Go to login page**:
   ```
   http://localhost:3000/autentificare
   ```

3. **Create an account or login**

4. **Go to post page**:
   ```
   http://localhost:3000/postare
   ```

5. **Fill the form**:
   - Title: "Test Product"
   - Price: 100
   - Category: Any
   - Description: "This is a test"
   - Location: "București"
   - Phone: "0712345678"
   - Email: your email
   - **Images**: Upload 3-4 images (REQUIRED)

6. **Click "Publică Anunțul ACUM!"**

7. **You should see**: "Anunț creat cu succes!"

8. **Check your dashboard**:
   ```
   http://localhost:3000/dashboard
   ```
   Your ad should appear there!

---

## 🔍 Troubleshooting

### Problem: "Bucket not found"
**Solution**: You skipped Step 2. Go back and create the bucket.

### Problem: "RLS policy violation" 
**Solution**: 
- Make sure you're logged in when posting
- The SQL script creates proper policies
- Run the SQL script again if needed

### Problem: "Upload failed"
**Solution**:
- Check file size (max 10MB)
- Check file type (only images)
- Make sure bucket is PUBLIC (check in Supabase UI)

### Problem: "Service role key not found"
**Solution**: Complete Step 1 - add the key to .env.local

### Problem: Images upload but don't display
**Solution**:
- Bucket must be PUBLIC
- Test the public URL directly in browser
- Check browser console for CORS errors

---

## 📋 Quick Checklist

Before testing, make sure:

- [ ] `.env.local` file exists with all values
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is added (not the anon key!)
- [ ] Listings bucket created in Supabase
- [ ] Bucket is set to **PUBLIC** ✅
- [ ] 4 storage policies created (or SQL script run successfully)
- [ ] Test script passes (node tmp_rovodev_test_complete_flow.js)
- [ ] Can upload via HTML test page
- [ ] Can login to the app
- [ ] Can post ads with images

---

## 🎉 Success Criteria

You'll know everything works when:

1. ✅ Test script shows all green checkmarks
2. ✅ HTML test page uploads and displays images
3. ✅ Can post ads with 3-4 images in the app
4. ✅ Images display correctly in listings
5. ✅ Public URLs work in browser

---

## 🧹 Cleanup (After Everything Works)

Once everything is working, clean up test files:

```bash
rm tmp_rovodev_*.js
rm tmp_rovodev_*.sql
rm tmp_rovodev_*.html
rm tmp_rovodev_*.sh
rm tmp_rovodev_*.md
rm STORAGE_FIX_GUIDE.md
```

**Keep:** `.env.local` (but NEVER commit it to git!)

---

## 🚀 Ready to Deploy?

After local testing works:

1. **Add environment variables to Vercel**:
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add all variables from `.env.local`
   - Make sure to add `SUPABASE_SERVICE_ROLE_KEY`!

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Fix storage bucket and image uploads"
   git push
   ```

3. **Verify in production**:
   - Test posting an ad on your live site
   - Check that images upload and display correctly

---

## 📞 Still Stuck?

Check these resources:
1. Supabase Storage Docs: https://supabase.com/docs/guides/storage
2. Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
3. Check Supabase Logs: Dashboard > Logs

**Common issues:**
- Forgot to make bucket public
- Wrong service role key
- Policies not created
- Not logged in when testing

---

**Good luck! 🎉**

Follow the steps in order and you'll have image uploads working in no time!
