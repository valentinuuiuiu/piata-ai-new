#!/bin/bash
# Quick deployment without prompts

echo "🚀 Quick Deploy to Production"
echo ""

# Add all files
git add -A

# Commit
git commit -m "feat: add comprehensive marketing automation system

- Add 5 new cron jobs for marketing automation
- Email campaigns for user re-engagement
- Shopping agents runner with email notifications
- Social media content generator
- Weekly digest emails
- Auto-repost system for listings
- Marketing automation database tables
- Update vercel.json with all cron schedules" || echo "No changes to commit"

# Push to main
echo "Pushing to GitHub..."
git push origin main

# Deploy to Vercel
echo ""
echo "Deploying to Vercel production..."
npx vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check status: npx vercel logs"
echo "View crons: npx vercel crons ls"
