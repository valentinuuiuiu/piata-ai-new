# Database Migration Guide: Old DB → New DB

## Overview
Migrate tables and data from old Supabase DB to new Supabase DB while keeping the project connected to Vercel.

## Old Database
- URL: `https://oikhfoaltormcigauobs.supabase.co`
- Has: subcategories, login/auth setup

## New Database
- URL: `https://ndzoavaveppnclkujjhh.supabase.co`
- Connected to: Vercel project `piata-ai-new`
- Needs: tables from old DB + credits system

---

## Step 1: Run Migration SQL

1. Open **NEW Supabase Dashboard**: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh
2. Go to **SQL Editor**
3. Copy and paste the contents of `migrate-from-old-db.sql`
4. Click **Run**

This will create all necessary tables with proper schemas.

---

## Step 2: Copy Data from Old DB (Optional)

If you want to copy existing data (categories, subcategories, users, listings):

### Option A: Manual Export/Import

1. **Export from OLD DB:**
   - Go to old DB: https://supabase.com/dashboard/project/oikhfoaltormcigauobs
   - Table Editor → Select table → Export as CSV

2. **Import to NEW DB:**
   - Go to new DB SQL Editor
   - Use `COPY` command or Table Editor import

### Option B: Using SQL (Recommended for small data)

Run this in OLD database to export:
```sql
-- Export categories
SELECT * FROM categories;

-- Export subcategories
SELECT * FROM subcategories;
```

Then insert the data manually into NEW database.

---

## Step 3: Update Environment Variables in Vercel

The `.env.local` is already updated to use the NEW database:
```
NEXT_PUBLIC_SUPABASE_URL=https://ndzoavaveppnclkujjhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Make sure these are also set in **Vercel Dashboard**:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Ensure these are set (should be auto-set by Supabase connector):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ← **You need to add this manually!**

### Get Service Role Key:
1. Go to NEW Supabase: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api
2. Copy the `service_role` key (under "Project API keys")
3. Add it to Vercel environment variables

---

## Step 4: Enable Supabase Auth

If you had auth working in the old DB:

1. **NEW Supabase Dashboard** → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates if needed

---

## Step 5: Deploy & Test

1. Push the updated code (already done):
   ```bash
   git push origin claude/migrate-database-credentials-014H1YTkVyCMuFuPXmUvWGae
   ```

2. Vercel will auto-deploy

3. Test:
   - Categories should load
   - Subcategories should work
   - Auth should work
   - Credits system should work

---

## Troubleshooting

### Build fails with database errors
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Check that tables exist in NEW database

### Categories/Subcategories don't show
- Run the migration SQL
- Check RLS policies are enabled
- Verify data was copied from old DB

### Auth doesn't work
- Enable Email provider in NEW Supabase
- Check that `users` table exists
- Verify auth callback URL in Supabase settings

---

## Quick Commands Reference

```bash
# Build locally
npm run build

# Test connection to new DB
# (Will be tested automatically on Vercel deploy)
```

---

## What's Already Done ✅
- ✅ Updated `.env.local` to use NEW database
- ✅ Fixed build errors
- ✅ Pushed to branch: `claude/migrate-database-credentials-014H1YTkVyCMuFuPXmUvWGae`
- ✅ Vercel connector already set up

## What You Need to Do 📝
1. Run `migrate-from-old-db.sql` in NEW Supabase
2. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
3. (Optional) Copy data from old DB
4. Test the deployment
