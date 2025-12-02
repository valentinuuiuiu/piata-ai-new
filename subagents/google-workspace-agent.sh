#!/bin/bash
# Jules Subagent: The Communicator (Google Workspace)
# "I speak to the world through email, calendar, and docs."

echo "Awakening the Google Workspace Communicator..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -E "(GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_REFRESH_TOKEN)" | xargs)
fi

# Validate credentials exist
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ ERROR: Google Workspace credentials not found"
  echo "Required in .env.local:"
  echo "  - GOOGLE_CLIENT_ID"
  echo "  - GOOGLE_CLIENT_SECRET"
  echo "  - GOOGLE_REFRESH_TOKEN"
  exit 1
fi

echo "✅ Launching Google Workspace MCP server..."

# Launch the Google Workspace MCP server (Gmail, Calendar, Docs)
npx -y @modelcontextprotocol/server-google-workspace
