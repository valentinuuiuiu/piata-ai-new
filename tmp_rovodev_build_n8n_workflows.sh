#!/bin/bash

# Build and Deploy N8N Workflows for Piata AI Marketplace
# This script creates production-ready N8N workflows

set -e

echo "🚀 Building N8N Workflows for Piata AI Marketplace"
echo "=================================================="
echo ""

# Configuration
N8N_URL="http://localhost:5678"
WORKFLOWS_DIR="/tmp/piata_n8n_workflows"
SUPABASE_URL="https://ndzoavaveppnclkujjhh.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g"
APP_URL="http://localhost:3001"

# Create workflows directory
mkdir -p "$WORKFLOWS_DIR"
cd "$WORKFLOWS_DIR"

echo "📦 Creating Workflow 1: Daily Blog Generator"
cat > "workflow_blog_generator.json" << 'EOF'
{
  "name": "Piata AI - Daily Blog Generator",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * *"
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://ndzoavaveppnclkujjhh.supabase.co/rest/v1/anunturi",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "queryParameters": {
            "parameters": [
              {
                "name": "select",
                "value": "id,title,price,category_id,views"
              },
              {
                "name": "order",
                "value": "views.desc"
              },
              {
                "name": "limit",
                "value": "10"
              }
            ]
          }
        }
      },
      "name": "Get Trending Listings",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "=http://localhost:3001/api/cron/blog-daily",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({trigger: 'n8n', listings: $json}) }}",
        "options": {}
      },
      "name": "Trigger Blog Generation",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Get Trending Listings",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Trending Listings": {
      "main": [
        [
          {
            "node": "Trigger Blog Generation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "tags": []
}
EOF

echo "✅ Workflow 1 created"

echo ""
echo "📦 Creating Workflow 2: Shopping Agents Runner"
cat > "workflow_shopping_agents.json" << 'EOF'
{
  "name": "Piata AI - Shopping Agents Runner",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 * * * *"
            }
          ]
        }
      },
      "name": "Hourly Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "=http://localhost:3001/api/cron/shopping-agents-runner",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "source",
              "value": "n8n"
            }
          ]
        },
        "options": {}
      },
      "name": "Run Shopping Agents",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "https://ndzoavaveppnclkujjhh.supabase.co/rest/v1/automation_logs",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({task_name: 'shopping-agents', status: 'success', summary: $json}) }}",
        "options": {}
      },
      "name": "Log Execution",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Hourly Trigger": {
      "main": [
        [
          {
            "node": "Run Shopping Agents",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Run Shopping Agents": {
      "main": [
        [
          {
            "node": "Log Execution",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "tags": []
}
EOF

echo "✅ Workflow 2 created"

echo ""
echo "📦 Creating Workflow 3: Social Media Automation"
cat > "workflow_social_media.json" << 'EOF'
{
  "name": "Piata AI - Social Media Automation",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 */6 * * *"
            }
          ]
        }
      },
      "name": "Every 6 Hours",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "=http://localhost:3001/api/cron/social-media-generator",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "options": {}
      },
      "name": "Generate Social Media Posts",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    }
  ],
  "connections": {
    "Every 6 Hours": {
      "main": [
        [
          {
            "node": "Generate Social Media Posts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "tags": []
}
EOF

echo "✅ Workflow 3 created"

echo ""
echo "📦 Creating Workflow 4: Email Re-engagement"
cat > "workflow_email_reengagement.json" << 'EOF'
{
  "name": "Piata AI - Email Re-engagement Campaign",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 10 * * *"
            }
          ]
        }
      },
      "name": "Daily at 10 AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://ndzoavaveppnclkujjhh.supabase.co/rest/v1/user_profiles",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "queryParameters": {
            "parameters": [
              {
                "name": "select",
                "value": "user_id,email,last_login"
              },
              {
                "name": "lt.last_login",
                "value": "={{ new Date(Date.now() - 14*24*60*60*1000).toISOString() }}"
              },
              {
                "name": "limit",
                "value": "50"
              }
            ]
          }
        }
      },
      "name": "Get Inactive Users",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Send to marketing email API\nconst users = items[0].json;\nreturn users.map(user => ({\n  json: {\n    email: user.email,\n    user_id: user.user_id,\n    days_inactive: Math.floor((Date.now() - new Date(user.last_login).getTime()) / 86400000)\n  }\n}));"
      },
      "name": "Process Users",
      "type": "n8n-nodes-base.code",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Daily at 10 AM": {
      "main": [
        [
          {
            "node": "Get Inactive Users",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Inactive Users": {
      "main": [
        [
          {
            "node": "Process Users",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "tags": []
}
EOF

echo "✅ Workflow 4 created"

echo ""
echo "📊 Summary:"
echo "==========="
ls -lh "$WORKFLOWS_DIR"
echo ""
echo "✅ 4 Production workflows created!"
echo ""
echo "📋 Next Steps:"
echo "  1. Import workflows to N8N: http://localhost:5678"
echo "  2. Configure credentials (Supabase API Key, CRON_SECRET)"
echo "  3. Activate all workflows"
echo "  4. Monitor execution in automation_logs table"
echo ""
echo "🔗 Workflows location: $WORKFLOWS_DIR"
