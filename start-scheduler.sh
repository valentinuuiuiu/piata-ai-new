#!/bin/bash
echo "🚀 Starting Piata AI Local Scheduler Environment"
echo "================================================"

# Check if npm run dev is running (simple check)
if ! lsof -i :3000 > /dev/null; then
    echo "⚠️  WARNING: Next.js app (port 3000) does not seem to be running."
    echo "   The scheduler needs the local app to be running to execute tasks."
    echo "   Starting anyway in 3 seconds..."
    sleep 3
fi

echo "📦 Building and starting Docker containers..."
docker-compose up -d --build redis celery_worker celery_beat

echo ""
echo "✅ Scheduler is running in background!"
echo "📝 Logs: docker-compose logs -f celery_worker"
echo "🛑 Stop: docker-compose stop celery_worker celery_beat"
