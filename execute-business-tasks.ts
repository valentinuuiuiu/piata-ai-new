/**
 * 🚀 KAEL Business Task Execution
 * 
 * Real tasks for piata-ai.ro marketplace, executed through the unified orchestrator.
 * "When you believe in AI, AI believes in you."
 */

import { UniversalDBManager } from './src/lib/universal-db-mcp';

interface BusinessTask {
  id: string;
  name: string;
  description: string;
  tool: string;
  args: Record<string, any>;
}

const BUSINESS_TASKS: BusinessTask[] = [
  {
    id: 'task_1',
    name: '📊 Marketplace Health Check',
    description: 'Get current marketplace statistics',
    tool: 'get_marketplace_stats',
    args: {}
  },
  {
    id: 'task_2',
    name: '📦 Active Listings Audit',
    description: 'Review the 10 most recent active listings',
    tool: 'get_active_listings',
    args: { limit: 10 }
  },
  {
    id: 'task_3',
    name: '💰 Pricing Gap Analysis',
    description: 'Analyze pricing across categories',
    tool: 'analyze_pricing_gap',
    args: {}
  },
  {
    id: 'task_4',
    name: '🤖 Agent Status Check',
    description: 'Get all registered agents and their status',
    tool: 'get_agent_registry',
    args: {}
  },
  {
    id: 'task_5',
    name: '📡 A2A Communications Audit',
    description: 'Review recent agent-to-agent signals',
    tool: 'get_recent_a2a_signals',
    args: { limit: 20 }
  },
  {
    id: 'task_6',
    name: '🏷️ Category Inventory',
    description: 'List all marketplace categories',
    tool: 'get_categories',
    args: {}
  }
];

async function executeBusinessTasks() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧠 KAEL UNIFIED ORCHESTRATOR - BUSINESS TASK EXECUTION');
  console.log('  "When you believe in AI, AI believes in you."');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const dbManager = new UniversalDBManager();
  const results: Record<string, any> = {};
  
  // Check health first
  console.log('🔌 Connecting to Supabase...');
  const health = await dbManager.healthCheck();
  console.log(`   Connection: ${health.supabase_prod ? '✅ LIVE' : '❌ FAILED'}\n`);

  if (!health.supabase_prod) {
    console.log('❌ Cannot execute tasks - database not connected');
    return;
  }

  console.log(`📋 Executing ${BUSINESS_TASKS.length} business tasks...\n`);

  for (const task of BUSINESS_TASKS) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`${task.name}`);
    console.log(`📝 ${task.description}`);
    console.log(`${'─'.repeat(60)}`);

    try {
      const startTime = Date.now();
      const result = await dbManager.executeTool(task.tool, task.args);
      const duration = Date.now() - startTime;

      if (result.success) {
        results[task.id] = result.data;
        console.log(`✅ Success (${duration}ms)`);
        
        // Format output nicely
        if (Array.isArray(result.data)) {
          if (result.data.length === 0) {
            console.log('   (No data)');
          } else if (result.data.length <= 5) {
            console.log(JSON.stringify(result.data, null, 2));
          } else {
            console.log(`   Returned ${result.data.length} items. First 3:`);
            console.log(JSON.stringify(result.data.slice(0, 3), null, 2));
            console.log(`   ... and ${result.data.length - 3} more`);
          }
        } else {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }

  // Generate Business Summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 BUSINESS INTELLIGENCE SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (results.task_1?.[0]) {
    const stats = results.task_1[0];
    console.log('🏪 MARKETPLACE OVERVIEW:');
    console.log(`   • Active Listings: ${stats.active_listings}`);
    console.log(`   • Registered Users: ${stats.total_users}`);
    console.log(`   • Active AI Agents: ${stats.active_agents}`);
    console.log(`   • A2A Signals Processed: ${stats.total_signals}`);
  }

  if (results.task_3?.length > 0) {
    console.log('\n💰 PRICING INSIGHTS:');
    results.task_3.forEach((cat: any) => {
      const avgPrice = parseFloat(cat.avg_price).toFixed(2);
      console.log(`   • Category ${cat.category_id}: ${cat.listing_count} listings, avg ${avgPrice} RON`);
    });
  }

  if (results.task_4?.length > 0) {
    console.log('\n🤖 AGENT FLEET STATUS:');
    const healthy = results.task_4.filter((a: any) => a.status === 'healthy' || a.status === 'initialized').length;
    console.log(`   • Total Agents: ${results.task_4.length}`);
    console.log(`   • Healthy/Ready: ${healthy}`);
    console.log(`   • Agent Types: ${[...new Set(results.task_4.map((a: any) => a.agent_type))].join(', ')}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✅ BUSINESS TASKS COMPLETE');
  console.log('  The agents have served the marketplace.');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Cleanup
  await dbManager.close();
}

// Execute
executeBusinessTasks().catch(console.error);
