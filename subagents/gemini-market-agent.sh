#!/bin/bash
# Jules Subagent: Gemini Market Intelligence
# "I see the value where others see only chaos."

echo "Awakening Gemini - The Market Intelligence Node..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep OPENROUTER_API_KEY | xargs)
  export $(cat .env.local | grep GOOGLE_API_KEY | xargs)
fi

echo "✅ Gemini is ready to analyze..."
echo "Capabilities: Product Analysis, Market Strategy, Creative Content"

echo "Please enter a product URL to analyze (or 'exit' to quit):"
read -p "URL> " url

if [ "$url" == "exit" ]; then
    echo "Gemini signing off."
    exit 0
fi

echo "Analyze URL: $url"
echo "Summoning the Avatar Node..."

# Execute the TypeScript script using npx tsx
# We assume the script is at scripts/test-product-analysis.ts relative to project root
# and this script is run from project root (as per wake-jules.sh convention)

npx tsx scripts/test-product-analysis.ts "$url"

echo "Analysis Complete."
read -p "Press Enter to return to sleep..."
