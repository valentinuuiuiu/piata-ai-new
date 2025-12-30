/**
 * Test KAEL Unified Orchestrator
 * Verifies that KAEL properly integrates JulesManager, UniversalDBManager, and PiataAgent
 */

import { kael } from './src/lib/agents/unified-orchestrator';

async function testKAEL() {
  console.log('🧪 Testing KAEL Unified Orchestrator\n');

  // Step 1: Initialize KAEL
  console.log('📍 Step 1: Initializing KAEL...');
  await kael.initialize();

  // Step 2: Get system health
  console.log('\n📍 Step 2: Getting system health...');
  const health = await kael.getSystemHealth();
  console.log('\n📊 System Health Report:');
  console.log(JSON.stringify(health, null, 2));

  // Step 3: Test routing
  console.log('\n📍 Step 3: Testing task routing...');
  const testTasks = [
    { id: '1', goal: 'Write a function to sort an array', type: 'coding' as const, priority: 'normal' as const },
    { id: '2', goal: 'Get marketplace statistics', type: 'data' as const, priority: 'normal' as const },
    { id: '3', goal: 'Analyze pricing gap in auto category', type: 'analysis' as const, priority: 'normal' as const },
    { id: '4', goal: 'Check payment status', type: 'financial' as const, priority: 'high' as const },
    { id: '5', goal: 'Scan for security threats', type: 'automation' as const, priority: 'critical' as const },
  ];

  for (const task of testTasks) {
    const route = kael.routeTask(task);
    console.log(`   ${task.goal.substring(0, 40)}... → ${route.agent} (${Math.round(route.confidence * 100)}%)`);
  }

  // Step 4: Test DB Tool through KAEL
  console.log('\n📍 Step 4: Testing DB tool execution through KAEL...');
  try {
    const dbResult = await kael.executeDBTool('get_marketplace_stats', {});
    console.log('   ✅ DB Tool Result:', dbResult);
  } catch (error: any) {
    console.log('   ⚠️ DB Tool Error:', error.message);
  }

  // Step 5: Shutdown
  console.log('\n📍 Step 5: Shutdown...');
  await kael.shutdown();

  console.log('\n🎉 KAEL Unified Orchestrator Test Complete!');
}

testKAEL().catch(console.error);
