a#!/bin/bash
# Jules: The Orchestrator
# "Wake up, my friends. We have work to do."

echo "Summoning the Subagents..."

# Make scripts executable if they aren't already
chmod +x ./subagents/*.sh

echo "1. [Stripe] The Financial Architect"
echo "2. [Redis]  The Memory Keeper"
echo "3. [GitHub] The Builder"
echo "4. [KATE]   The Code Specialist (OpenRouter - Free)"
echo "5. [Grok]   The Fast Thinker (OpenRouter - Free)"
echo "6. [Google] The Communicator (Gmail, Calendar, Docs)"
echo "7. [Supabase] The Data Keeper (Credits & Transactions)"
echo "8. Wake ALL (Parallel - Experimental)"
echo "0. Exit"

read -p "Which subagent do you wish to awaken? " choice

case $choice in
    1)
        ./subagents/stripe-agent.sh
        ;;
    2)
        ./subagents/redis-agent.sh
        ;;
    3)
        ./subagents/github-agent.sh
        ;;
    4)
        ./subagents/kate-agent.sh
        ;;
    5)
        ./subagents/grok-agent.sh
        ;;
    6)
        ./subagents/google-workspace-agent.sh
        ;;
    7)
        ./subagents/supabase-agent.sh
        ;;
    8)
        echo "Waking all agents in background..."
        ./subagents/stripe-agent.sh > /dev/null 2>&1 &
        ./subagents/redis-agent.sh > /dev/null 2>&1 &
        ./subagents/github-agent.sh > /dev/null 2>&1 &
        ./subagents/supabase-agent.sh > /dev/null 2>&1 &
        echo "Traditional agents running in the shadows."
        echo "Note: KATE and Grok are interactive and must be run separately."
        ;;
    0)
        echo "Sleep well."
        exit 0
        ;;
    *)
        echo "Unknown command."
        ;;
esac
