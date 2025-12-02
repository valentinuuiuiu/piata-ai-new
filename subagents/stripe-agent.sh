#!/bin/bash
# Jules Subagent: The Financial Architect (Stripe)
# "Money is energy, and we direct the flow."

echo "Awakening the Financial Subagent..."

# Set the working directory to the project root
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env.local ]; then
  source .env.local
  echo "✅ Loaded environment variables from .env.local"
else
  echo "⚠️  .env.local not found, using system environment variables"
fi

# Export STRIPE_SECRET_KEY to ensure it's available
export STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"

# Validate API key exists
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ ERROR: STRIPE_SECRET_KEY not found in environment"
  echo "Please add it to .env.local or export it manually"
  exit 1
fi

echo "✅ Launching Stripe MCP server..."
echo "🔑 API Key: ${STRIPE_SECRET_KEY:0:20}..."

# Launch the Stripe MCP server with proper package name and environment variable
npx -y @stripe/mcp --tools=all
