#!/bin/bash

# Usage: ./scripts/jules-check-balance.sh <userId>

userId=$1

if [ -z "$userId" ]; then
  echo "Usage: ./scripts/jules-check-balance.sh <userId>"
  exit 1
fi

echo "🔍 Checking balance for user: $userId"
npx tsx scripts/jules-get-balance.ts "$userId"
