# 🚀 START HERE - Fix Image Upload in 3 Steps

## The Problem
Your images aren't uploading because the Supabase storage bucket doesn't exist yet.

---

## The Solution (5 minutes)

### 📝 STEP 1: Get Your Service Role Key

1. **Click this link**: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api

2. **Scroll down to "service_role"** (NOT anon)

3. **Click "Reveal"** and copy the key

4. **Open `.env.local`** in this folder and paste the key here:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste-your-key-here
   ```

5. **Save the file**

---

### 🗄️ STEP 2: Create the Storage Bucket

1. **Click this link**: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new

2. **Open this file**: `tmp_rovodev_complete_fix.sql`

3. **Copy ALL the content** (Ctrl+A, Ctrl+C)

4. **Paste into Supabase SQL Editor**

5. **Click "RUN"** (bottom right)

6. **Wait 5 seconds** - you should see success messages at the bottom!

---

### ✅ STEP 3: Test It

Run this command:
```bash
node tmp_rovodev_test_complete_flow.js
```

**You should see:**
- ✅ Connected to Supabase
- ✅ Listings bucket exists  
- ✅ Upload test successful!

**If you see errors**, something went wrong - check the steps above.

---

## 🎯 Now Test the App

```bash
npm run dev
```

1. Go to: http://localhost:3000/autentificare
2. Login or create account
3. Go to: http://localhost:3000/postare
4. Fill form + upload 3-4 images
5. Click "Publică Anunțul ACUM!"
6. Should see: "Anunț creat cu succes!" ✅

---

## 🧹 After Everything Works

Delete the test files:
```bash
rm tmp_rovodev_* START_HERE.md STORAGE_FIX_GUIDE.md
```

**That's it!** 🎉

---

## ⚠️ If It Doesn't Work

1. **Bucket not found?** 
   - Go back to Step 2, make sure SQL ran successfully

2. **RLS error?**
   - Make sure you're logged in when posting
   - Run the SQL script again

3. **Upload failed?**
   - Check file size (max 10MB)
   - Only image files allowed
   - Make sure bucket is PUBLIC (SQL script does this)

Need more help? Read: `tmp_rovodev_INSTRUCTIONS.md`
