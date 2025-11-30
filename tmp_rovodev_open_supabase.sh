#!/bin/bash

echo "🚀 Opening Supabase Dashboard..."
echo ""
echo "✅ Step 1: Get Service Role Key"
echo "   Opening: Settings > API"
open "https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api" 2>/dev/null || xdg-open "https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api" 2>/dev/null || echo "   URL: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/settings/api"

echo ""
echo "Press ENTER when you've copied the service_role key..."
read

echo ""
echo "✅ Step 2: Run SQL Script"
echo "   Opening: SQL Editor"
open "https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new" 2>/dev/null || xdg-open "https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new" 2>/dev/null || echo "   URL: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new"

echo ""
echo "📋 Now:"
echo "   1. Copy content from: tmp_rovodev_complete_fix.sql"
echo "   2. Paste into SQL Editor"
echo "   3. Click RUN"
echo ""
echo "Press ENTER when SQL has finished running..."
read

echo ""
echo "✅ Testing configuration..."
node tmp_rovodev_test_complete_flow.js
