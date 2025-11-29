# ✅ Simple Database Setup

## Your NEW database already has the schema defined in the repo!

### Option 1: Run Drizzle Migrations (Recommended)

```bash
# 1. Make sure you have the env configured
# (already done in .env.local)

# 2. Push the schema to new database
npx drizzle-kit push
```

This will create all 8 tables in your NEW database.

---

### Option 2: Run SQL Directly in Supabase

Go to: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new

Copy and paste these files in order:

1. **First:** `src/lib/drizzle/migrations/0000_tiny_daredevil.sql`
2. **Second:** `src/lib/drizzle/migrations/0001_modern_maggott.sql`

Click **Run** for each.

---

## Step 2: Copy Subcategories Data from Old DB

1. Go to OLD database: https://supabase.com/dashboard/project/oikhfoaltormcigauobs/editor

2. Click on `subcategories` table

3. Export data (or run this SQL):
```sql
SELECT * FROM subcategories ORDER BY category_id, id;
```

4. Copy the results

5. Go to NEW database: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/editor

6. Insert into `subcategories` table (or use INSERT SQL)

---

## That's it!

Your new database will have:
- ✅ All 8 tables
- ✅ Subcategories data from old DB
- ✅ Ready for Vercel deployment
