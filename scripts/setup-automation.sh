#!/bin/bash

# Automation Setup Script for Piata AI
# This initializes the cron job scheduler

echo "🚀 Setting up automation..."

# Check if Redis is running
if ! redis-cli ping &>/dev/null; then
  echo "❌ Redis is not running!"
  echo "Starting Redis..."
  redis-server --daemonize yes
  sleep 2
fi

echo "✅ Redis is running"

# Check if Next.js dev server is running
if ! curl -s http://localhost:3000 &>/dev/null; then
  echo "❌ Next.js server is not running!"
  echo "Please start it with: npm run dev"
  exit 1
fi

echo "✅ Next.js server is running"

# Setup default cron jobs
echo "📝 Setting up default cron jobs..."
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "setup-defaults"}' \
  | jq '.'

# Start the scheduler
echo "⏰ Starting the scheduler..."
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}' \
  | jq '.'

# List active jobs
echo "📋 Active jobs:"
curl -s http://localhost:3000/api/scheduler | jq '.jobs'

echo ""
echo "✅ Automation is now running!"
echo "📊 Check status: curl http://localhost:3000/api/scheduler"
echo "🛑 Stop scheduler: curl -X POST http://localhost:3000/api/scheduler -H 'Content-Type: application/json' -d '{\"action\": \"stop\"}'"
