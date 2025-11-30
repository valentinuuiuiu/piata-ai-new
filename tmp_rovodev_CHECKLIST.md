# ✅ PIATA AI RO - Image Upload Fix Checklist

Print this or keep it open while you work!

---

## 📝 Pre-Flight Check

- [ ] I have access to Supabase dashboard
- [ ] I can see my project: ndzoavaveppnclkujjhh
- [ ] I have a code editor open (VS Code, etc.)
- [ ] I have a terminal open in the project folder

---

## 🔧 STEP 1: Add Service Role Key (2 minutes)

### What to do:
1. [ ] Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api
2. [ ] Scroll down to "Project API keys"
3. [ ] Find the section that says **"service_role"** (secret)
4. [ ] Click the **"Reveal"** or **"Copy"** button
5. [ ] Open `.env.local` file in your project
6. [ ] Find the line: `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here...`
7. [ ] Replace `your-service-role-key-here...` with the key you copied
8. [ ] Save the file (Ctrl+S / Cmd+S)

### ✅ Verification:
```bash
# Run this to check if the key is set:
grep "SUPABASE_SERVICE_ROLE_KEY=eyJ" .env.local
```
If you see the key (starts with `eyJ`), you're good! ✅

---

## 🗄️ STEP 2: Create Storage Bucket (3 minutes)

### What to do:
1. [ ] Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new
2. [ ] In your code editor, open: `tmp_rovodev_complete_fix.sql`
3. [ ] Select ALL text (Ctrl+A / Cmd+A)
4. [ ] Copy (Ctrl+C / Cmd+C)
5. [ ] Go back to Supabase SQL Editor tab
6. [ ] Paste (Ctrl+V / Cmd+V)
7. [ ] Click the **"RUN"** button (bottom right corner)
8. [ ] Wait 5-10 seconds

### ✅ Verification:
Look at the bottom of the SQL Editor. You should see:
```
✅ Storage bucket and policies have been configured successfully!
✅ Anunturi table RLS policies have been updated!
📸 You can now upload images to the listings bucket!
```

If you see errors instead, read them carefully and try again.

---

## 🧪 STEP 3: Test Everything (2 minutes)

### What to do:
1. [ ] Go to your terminal
2. [ ] Make sure you're in the project folder
3. [ ] Run this command:
```bash
node tmp_rovodev_test_complete_flow.js
```

### ✅ Expected Output:
```
✅ Connected to Supabase
✅ Listings bucket exists
✅ Found X files in bucket
✅ Found X listings
✅ Upload test successful!
```

### ❌ If you see errors:
- "Bucket not found" → Go back to Step 2, run SQL again
- "Service role key" error → Go back to Step 1, check the key
- Other errors → Read the error message carefully

---

## 🌐 STEP 4: Test in Browser (Optional but Recommended)

### What to do:
1. [ ] Find the file: `tmp_rovodev_test_upload.html`
2. [ ] Double-click to open in browser
3. [ ] Click "Check Policies" button
4. [ ] You should see: "Found 1 buckets: listings (public: true)"
5. [ ] Click "Select an Image" and choose any image
6. [ ] Click "Test Upload"
7. [ ] You should see: "✅ Upload successful!"
8. [ ] The image should appear on the page

---

## 🎯 STEP 5: Test the Real App (5 minutes)

### Start the app:
```bash
npm run dev
```

### Test flow:
1. [ ] Go to: http://localhost:3000/autentificare
2. [ ] Login or create a new account
3. [ ] Go to: http://localhost:3000/postare
4. [ ] Fill in the form:
   - [ ] Title: "Test Product"
   - [ ] Price: "100"
   - [ ] Category: Select any
   - [ ] Description: "This is a test listing"
   - [ ] Location: "București"
   - [ ] Phone: "0712345678"
   - [ ] Email: Your email
   - [ ] **Images: Upload 3-4 images** (IMPORTANT!)
5. [ ] Click "Publică Anunțul ACUM!"
6. [ ] Should redirect to dashboard
7. [ ] You should see your listing with images!

### ✅ Success Criteria:
- [ ] No errors during form submission
- [ ] Redirected to dashboard
- [ ] Your listing appears in the list
- [ ] Images are visible in the listing
- [ ] Clicking the listing shows all images

---

## 🎉 SUCCESS! What Now?

If all checks passed:

1. [ ] **Clean up test files:**
```bash
rm tmp_rovodev_* START_HERE.md STORAGE_FIX_GUIDE.md
```

2. [ ] **Keep these files:**
   - `.env.local` (but never commit to git!)
   - Your actual source code

3. [ ] **Deploy to production:**
   - Add environment variables to Vercel/hosting
   - Push your code
   - Test on live site

---

## ❌ Troubleshooting

### Images upload but don't display
- [ ] Check bucket is PUBLIC in Supabase dashboard
- [ ] Go to: Storage > listings > Click settings icon > Make sure "Public" is checked

### "Permission denied" errors
- [ ] Make sure you're logged in when posting
- [ ] Check RLS policies were created (run SQL script again)

### "Bucket not found" in production
- [ ] Storage bucket only exists in one Supabase project
- [ ] Make sure production uses the same Supabase project
- [ ] Or run the SQL script on production database too

### Service role key errors
- [ ] Make sure you copied the SERVICE_ROLE key, not ANON key
- [ ] Check there are no extra spaces in .env.local
- [ ] Key should start with: `eyJ`

---

## 📊 Final Status

Mark these when complete:

- [ ] Service role key added to .env.local
- [ ] SQL script run successfully in Supabase
- [ ] Node test script passes (all ✅)
- [ ] Browser test uploads images
- [ ] Can post ads with images in the app
- [ ] Images display correctly
- [ ] Test files cleaned up

**Total time: ~15 minutes**

---

## 🆘 Still Having Issues?

1. Check Supabase logs:
   - Dashboard > Logs > Select "Storage"

2. Check browser console:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. Re-run the SQL script:
   - Sometimes policies need to be recreated
   - Run `tmp_rovodev_complete_fix.sql` again

4. Verify bucket exists:
   - Dashboard > Storage
   - Should see "listings" bucket
   - Should say "Public: Yes"

---

**Good luck! You've got this! 💪**
