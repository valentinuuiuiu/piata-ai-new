#!/bin/bash

# Deploy Database Fixes to Supabase
# This script prepares SQL for execution in Supabase SQL Editor

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     SUPABASE DATABASE DEPLOYMENT SCRIPT                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

SUPABASE_URL="https://ndzoavaveppnclkujjhh.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g"

echo "📋 Deployment Steps:"
echo "   1. Create missing tables (user_credits, credit_transactions, shopping_cart, orders)"
echo "   2. Install pg_cron extension and configure jobs"
echo "   3. Verify all tables exist"
echo ""

# Test Supabase connection
echo "🔗 Testing Supabase connection..."
HEALTH_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -w "\n%{http_code}" | tail -1)

if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✅ Supabase connection successful!"
else
  echo "❌ Supabase connection failed (HTTP $HEALTH_CHECK)"
  echo "   Please check your SUPABASE_URL and SUPABASE_KEY"
  exit 1
fi

echo ""
echo "📂 SQL Files Ready:"
echo "   1. tmp_rovodev_fix_missing_tables.sql"
echo "   2. tmp_rovodev_supabase_pg_cron_setup.sql"
echo ""

# Check if SQL files exist
if [ ! -f "tmp_rovodev_fix_missing_tables.sql" ]; then
  echo "❌ Error: tmp_rovodev_fix_missing_tables.sql not found"
  exit 1
fi

if [ ! -f "tmp_rovodev_supabase_pg_cron_setup.sql" ]; then
  echo "❌ Error: tmp_rovodev_supabase_pg_cron_setup.sql not found"
  exit 1
fi

echo "✅ All SQL files found"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "DEPLOYMENT INSTRUCTIONS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⚠️  Note: Supabase REST API doesn't support SQL execution."
echo "   You need to run these scripts in the Supabase SQL Editor."
echo ""
echo "STEP 1: Open Supabase SQL Editor"
echo "   URL: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql"
echo ""
echo "STEP 2: Run tmp_rovodev_fix_missing_tables.sql"
echo "   - Copy contents of file"
echo "   - Paste into SQL Editor"
echo "   - Click 'Run' button"
echo "   - Verify: Should create 4 tables"
echo ""
echo "STEP 3: Run tmp_rovodev_supabase_pg_cron_setup.sql"
echo "   - Copy contents of file"
echo "   - Paste into SQL Editor"
echo "   - Click 'Run' button"
echo "   - Verify: Should create 6+ cron jobs"
echo ""
echo "STEP 4: Verify tables exist"
echo "   Run this query in SQL Editor:"
echo "   SELECT table_name FROM information_schema.tables"
echo "   WHERE table_schema = 'public' AND table_name IN"
echo "   ('user_credits', 'credit_transactions', 'shopping_cart', 'orders');"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Display SQL file contents for easy copy-paste
echo "📄 SQL FILE 1: tmp_rovodev_fix_missing_tables.sql"
echo "═══════════════════════════════════════════════════════════"
cat tmp_rovodev_fix_missing_tables.sql | head -50
echo ""
echo "... ($(wc -l < tmp_rovodev_fix_missing_tables.sql) lines total)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""

# Verification check using Supabase REST API
echo "🔍 Checking existing tables via REST API..."
echo ""

# Check if user_credits exists
USER_CREDITS_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/user_credits?limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -w "\n%{http_code}" | tail -1)

if [ "$USER_CREDITS_CHECK" = "200" ]; then
  echo "✅ user_credits table: EXISTS"
else
  echo "❌ user_credits table: NOT FOUND (needs creation)"
fi

# Check if credit_transactions exists
TRANSACTIONS_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/credit_transactions?limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -w "\n%{http_code}" | tail -1)

if [ "$TRANSACTIONS_CHECK" = "200" ]; then
  echo "✅ credit_transactions table: EXISTS"
else
  echo "❌ credit_transactions table: NOT FOUND (needs creation)"
fi

# Check if shopping_cart exists
CART_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/shopping_cart?limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -w "\n%{http_code}" | tail -1)

if [ "$CART_CHECK" = "200" ]; then
  echo "✅ shopping_cart table: EXISTS"
else
  echo "❌ shopping_cart table: NOT FOUND (needs creation)"
fi

# Check if orders exists
ORDERS_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/orders?limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -w "\n%{http_code}" | tail -1)

if [ "$ORDERS_CHECK" = "200" ]; then
  echo "✅ orders table: EXISTS"
else
  echo "❌ orders table: NOT FOUND (needs creation)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 QUICK START:"
echo "   1. Copy tmp_rovodev_fix_missing_tables.sql"
echo "   2. Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql"
echo "   3. Paste and Run"
echo "   4. Repeat for tmp_rovodev_supabase_pg_cron_setup.sql"
echo ""
echo "✅ Script complete! Ready for manual SQL execution."
echo ""
