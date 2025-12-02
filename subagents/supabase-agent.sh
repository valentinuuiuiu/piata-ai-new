#!/bin/bash
# Jules Subagent: The Data Keeper (Supabase)
# "Data is the foundation, we manage the flow."

echo "Awakening the Data Subagent..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep SUPABASE | xargs)
fi

# Validate API key exists
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ ERROR: SUPABASE_URL or SUPABASE_ANON_KEY not found in environment"
  echo "Please add them to .env.local or export them manually"
  echo "Required: SUPABASE_URL, SUPABASE_ANON_KEY"
  exit 1
fi

echo "✅ Launching Supabase MCP server..."
echo "📊 Database URL: $SUPABASE_URL"

# Launch the Supabase MCP server
# Note: We'll use a generic MCP approach since official Supabase MCP may not exist
# Instead, we'll create a custom integration that handles both queries and mutations

# For now, let's create a simple data manager that can be enhanced
echo "🔄 Starting custom Supabase data manager..."

# Create a custom MCP-like server for Supabase operations
npx tsx src/lib/supabase-mcp-manager.ts &
echo "Supabase agent started with PID: $!"

# Keep the process running
wait