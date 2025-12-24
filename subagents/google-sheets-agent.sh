#!/bin/bash
# Jules Subagent: The Data Organizer (Google Sheets)
# "Every transaction deserves a story, every story deserves a spreadsheet."

echo "Awakening the Google Sheets Data Organizer..."

# Set the working directory to the project root
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env.local ]; then
  source .env.local
  echo "✅ Loaded environment variables from .env.local"
else
  echo "⚠️  .env.local not found, using system environment variables"
fi

# Validate Google API credentials
if [ -z "$GOOGLE_API_KEY" ]; then
  echo "❌ ERROR: GOOGLE_API_KEY not found in environment"
  echo "Please add it to .env.local or export it manually"
  exit 1
fi

echo "✅ Launching Google Sheets MCP server..."
echo "📊 API Key: ${GOOGLE_API_KEY:0:20}..."

# Launch the Google Sheets MCP server
npx -y @modelcontextprotocol/server-google-sheets --api-key "$GOOGLE_API_KEY"