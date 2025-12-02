#!/bin/bash
# Verify Marketing Automation Deployment

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="https://piata-ai.vercel.app"

echo "🔍 VERIFYING MARKETING AUTOMATION DEPLOYMENT"
echo "=============================================="
echo ""

# Test health endpoint
echo -e "${YELLOW}1. Testing health endpoint...${NC}"
if curl -s "$DOMAIN/api/health" | grep -q "status"; then
    echo -e "${GREEN}✓ Health endpoint OK${NC}"
else
    echo -e "${RED}✗ Health endpoint failed${NC}"
fi
echo ""

# Test each cron endpoint
echo -e "${YELLOW}2. Testing cron endpoints...${NC}"

endpoints=(
    "blog-daily"
    "check-agents"
    "auto-repost"
    "shopping-agents-runner"
    "marketing-email-campaign"
    "social-media-generator"
    "weekly-digest"
)

for endpoint in "${endpoints[@]}"; do
    echo -n "Testing $endpoint... "
    response=$(curl -s "$DOMAIN/api/cron/$endpoint" -w "%{http_code}" -o /tmp/response.json)
    http_code=$(tail -n1 <<< "$response")
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        cat /tmp/response.json
    fi
done
echo ""

# Check GitHub
echo -e "${YELLOW}3. Checking GitHub repository...${NC}"
if git log --oneline -1 | grep -q "marketing automation"; then
    echo -e "${GREEN}✓ Latest commit includes marketing automation${NC}"
else
    echo -e "${YELLOW}⚠ Latest commit: $(git log --oneline -1)${NC}"
fi
echo ""

# Check files exist
echo -e "${YELLOW}4. Verifying files exist...${NC}"
files=(
    "src/app/api/cron/marketing-email-campaign/route.ts"
    "src/app/api/cron/shopping-agents-runner/route.ts"
    "src/app/api/cron/social-media-generator/route.ts"
    "src/app/api/cron/weekly-digest/route.ts"
    "supabase/migrations/011_marketing_automation_tables.sql"
    "supabase/migrations/012_setup_supabase_cron.sql"
    "DEPLOYMENT_COMPLETE.md"
    "FINAL_SUMMARY.md"
    "ACTION_PLAN.md"
    "CRON_SCHEDULE.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
    fi
done
echo ""

# Summary
echo -e "${YELLOW}=============================================="
echo "DEPLOYMENT VERIFICATION COMPLETE"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Add environment variables to Vercel:"
echo "   - OPENROUTER_API_KEY"
echo "   - RESEND_API_KEY"
echo "   - CRON_SECRET"
echo ""
echo "2. Monitor logs: npx vercel logs --follow"
echo ""
echo "3. Check first execution tomorrow at 7 AM UTC"
echo ""
echo -e "Full documentation: ${GREEN}ACTION_PLAN.md${NC}"
echo -e "${NC}"
