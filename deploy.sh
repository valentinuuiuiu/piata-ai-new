#!/bin/bash

# Vercel Deployment Script for piataAI
echo "🚀 Deploying piataAI to Vercel..."

# Set environment variables
export VERCEL_ORG_ID="valentinuuiuiu"
export VERCEL_PROJECT_ID="piata-ai-new"

# Deploy with automatic responses
echo "y" | npx vercel --prod --confirm

echo "✅ Deployment complete!"