#!/bin/bash

# Usage: ./scripts/jules-transaction-history.sh <userId>

userId=$1

if [ -z "$userId" ]; then
  echo "Usage: ./scripts/jules-transaction-history.sh <userId>"
  exit 1
fi

echo "⏳ Fetching transaction history for user: $userId"
npx tsx scripts/jules-get-history.ts "$userId"
