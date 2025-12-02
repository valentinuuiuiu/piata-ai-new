#!/bin/bash
# Jules Subagent: The Builder (GitHub)
# "Code is the DNA of our world."

echo "Awakening the Builder Subagent..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep GITHUB_PERSONAL_ACCESS_TOKEN | xargs)
fi

# Validate token exists
if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "❌ ERROR: GITHUB_PERSONAL_ACCESS_TOKEN not found in environment"
  echo "Please add it to .env.local or export it manually"
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ ERROR: Docker is not running"
  echo "Please start Docker and try again"
  exit 1
fi

echo "✅ Launching GitHub MCP server via Docker..."

# Launch the GitHub MCP server
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN \
  -e GITHUB_TOOLSETS="" \
  -e GITHUB_READ_ONLY="" \
  ghcr.io/github/github-mcp-server
