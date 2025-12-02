#!/bin/bash

echo "🚀 Running Jules Financial Status..."
echo ""

echo "🔍 Checking for running agents..."
ps aux | grep -E "(stripe|subagents)" --color=always
echo ""

echo "🔗 Supabase Dashboard:"
echo "https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh"
echo ""

echo "📊 Financial Metrics:"
npx tsx scripts/jules-financial-metrics.ts | jq .
echo ""
echo "✅ Financial Status check complete."
