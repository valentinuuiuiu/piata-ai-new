#!/bin/bash
# Jules Subagent: Gemini Market Intelligence
# "I see the value where others see only chaos."

echo "Awakening Gemini - The Market Intelligence Node..."

# Load environment variables
if [ -f .env.local ]; then
  # Load env vars but ignore comments and empty lines
  export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

echo "✅ Gemini is ready to operate autonomously..."
echo "Capabilities: Product Analysis, Market Strategy, Creative Content, A2A Communication"
echo "---------------------------------------------------"
echo "Select Mode:"
echo "1. One-off Analysis (Legacy)"
echo "2. Autonomous Agent Loop (New A2A Protocol)"
echo "3. Send Task to Autonomous Agent"
echo "---------------------------------------------------"
read -p "Mode> " mode

if [ "$mode" == "1" ]; then
    echo "Please enter a product URL to analyze (or 'exit' to quit):"
    read -p "URL> " url

    if [ "$url" == "exit" ]; then
        echo "Gemini signing off."
        exit 0
    fi

    echo "Analyze URL: $url"
    echo "Summoning the Avatar Node..."
    npx tsx scripts/test-product-analysis.ts "$url"
    echo "Analysis Complete."

elif [ "$mode" == "2" ]; then
    echo "Starting Autonomous Loop for agent 'Gemini'..."
    npx tsx scripts/run-agent-loop.ts Gemini

elif [ "$mode" == "3" ]; then
    echo "Sending task signal to agent network..."
    read -p "Task Description> " task
    # We use a helper script to inject a signal (simulated here via simple node script)
    npx tsx -e "
      import { a2aSignalManager } from './src/lib/a2a/signal-manager';
      a2aSignalManager.callAgentEnhanced('Gemini', { description: '$task' }, 'UserConsole')
        .then(() => console.log('Signal sent!'))
        .catch(console.error)
        .finally(() => process.exit(0));
    "
else
    echo "Invalid mode. Exiting."
    exit 1
fi
