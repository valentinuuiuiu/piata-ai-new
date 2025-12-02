#!/bin/bash
# Jules Subagent: The Memory Keeper (Redis)
# "I remember everything, so you don't have to."

echo "Awakening the Memory Subagent..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep REDIS_URL | xargs)
fi

# Default to localhost if not set
REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}

echo "✅ Connecting to Redis at $REDIS_URL"

# Launch the Redis MCP server
uvx mcp-server-redis --url "$REDIS_URL"
