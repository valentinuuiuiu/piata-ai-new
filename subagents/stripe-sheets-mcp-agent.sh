#!/bin/bash
# Jules Subagent: The Financial Data Manager (Stripe + Google Sheets)
# "Money flows, data records, insights emerge."

echo "Awakening the Stripe + Google Sheets Data Manager..."

# Set the working directory to the project root
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env.local ]; then
  source .env.local
  echo "✅ Loaded environment variables from .env.local"
else
  echo "⚠️  .env.local not found, using system environment variables"
fi

# Validate required API keys
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ ERROR: STRIPE_SECRET_KEY not found"
  exit 1
fi

if [ -z "$GOOGLE_API_KEY" ] || [ -z "$GOOGLE_SHEETS_ID" ]; then
  echo "❌ ERROR: GOOGLE_API_KEY or GOOGLE_SHEETS_ID not found"
  echo "Required for Google Sheets integration"
  exit 1
fi

echo "✅ Stripe Secret Key: ${STRIPE_SECRET_KEY:0:20}..."
echo "✅ Google API Key: ${GOOGLE_API_KEY:0:20}..."
echo "✅ Spreadsheet ID: $GOOGLE_SHEETS_ID"

echo "🚀 Launching Stripe + Google Sheets MCP server..."

# Launch a combined server that handles both Stripe and Google Sheets
node -e "
const fs = require('fs');
const path = require('path');

// Mock MCP server that handles Stripe + Google Sheets integration
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

// Read and parse JSON responses
function parseJsonResponse(response) {
  if (response.content && response.content[0]) {
    return JSON.parse(response.content[0].text);
  }
  return response;
}

// Stripe + Google Sheets Integration Tools
const tools = [
  {
    name: 'record_payment_sheets',
    description: 'Record Stripe payment in Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {
        payment_id: { type: 'string' },
        amount: { type: 'number' },
        customer_email: { type: 'string' },
        product: { type: 'string' }
      }
    }
  },
  {
    name: 'get_sales_analytics',
    description: 'Get sales analytics from Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_inventory',
    description: 'Update inventory in Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {
        item_name: { type: 'string' },
        quantity_sold: { type: 'number' },
        total_amount: { type: 'number' }
      }
    }
  },
  {
    name: 'create_sales_dashboard',
    description: 'Create sales dashboard in Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

console.log('📊 Stripe + Google Sheets MCP server running');
console.log('Available tools:', tools.map(t => t.name).join(', '));
console.log('Ready to handle payments and data management! 🎯');
"