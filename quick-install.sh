#!/bin/bash
# Quick Install Script - Redis + n8n (Native)
# Run this to install everything in one go

set -e

echo "🚀 Installing Redis and n8n natively..."
echo "========================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ Don't run as root. Run as regular user, will ask for sudo when needed."
   exit 1
fi

# Install Redis
echo ""
echo "📦 1/3: Installing Redis..."
sudo apt update
sudo apt install -y redis-server

echo "✅ Redis installed!"

# Start Redis
echo ""
echo "🔄 2/3: Starting Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running on localhost:6379"
else
    echo "⚠️  Redis installed but not responding"
fi

# Install n8n
echo ""
echo "📦 3/3: Installing n8n globally..."
sudo npm install -g n8n pm2

echo "✅ n8n installed!"

# Start n8n with PM2
echo ""
echo "🔄 Starting n8n with PM2..."
pm2 start n8n
pm2 save
sudo pm2 startup

echo ""
echo "✅ All done!"
echo "========================================="
echo ""
echo "📊 Service Status:"
echo "  Redis:  redis-cli ping"
echo "  n8n UI: http://localhost:5678"
echo ""
echo "🔍 Check services:"
echo "  pm2 status"
echo "  sudo systemctl status redis-server"
echo ""
echo "🎯 Next steps:"
echo "  1. Open http://localhost:5678 in browser"
echo "  2. Create n8n admin account"
echo "  3. Start building workflows!"
echo ""
