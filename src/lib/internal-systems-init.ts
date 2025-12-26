/**
 * Internal Systems Initialization
 * 
 * Initializes all internal systems:
 * - Workflow Registry
 * - Workflow Executor
 * - Internal Agent Manager (Jules, Kate, Grok)
 * - Tracing
 * 
 * Everything is internal - we own it completely!
 */

import { initializeWorkflowRegistry } from './internal-workflow-registry';
import { initializeWorkflowExecutor, getWorkflowExecutor } from './internal-workflow-executor';
import { initializeInternalAgentManager, getInternalAgentManager } from './internal-agent-manager';
import { JulesManager } from './jules-manager';
import { initializeTracing } from './tracing';

let initialized = false;

/**
 * Initialize all internal systems
 */
export async function initializeInternalSystems() {
  if (initialized) {
    console.log('⚠️  Internal systems already initialized');
    return;
  }

  console.log('\n🚀 Initializing Internal Systems...\n');

  try {
    // 1. Initialize Tracing
    console.log('1️⃣  Initializing Tracing...');
    initializeTracing();
    console.log('   ✅ Tracing initialized\n');

    // 2. Initialize Jules Manager
    console.log('2️⃣  Initializing Jules Manager...');
    const julesManager = new JulesManager();
    await julesManager.initialize();
    console.log('   ✅ Jules Manager initialized\n');

    // 3. Initialize Internal Agent Manager
    console.log('3️⃣  Initializing Internal Agent Manager...');
    await initializeInternalAgentManager(julesManager);
    console.log('   ✅ Internal Agent Manager initialized\n');

    // 4. Initialize Workflow Registry
    console.log('4️⃣  Initializing Workflow Registry...');
    await initializeWorkflowRegistry();
    console.log('   ✅ Workflow Registry initialized\n');

    // 5. Initialize Workflow Executor
    console.log('5️⃣  Initializing Workflow Executor...');
    await initializeWorkflowExecutor(julesManager);
    console.log('   ✅ Workflow Executor initialized\n');

    initialized = true;

    console.log('✅ All Internal Systems Initialized Successfully!\n');
    console.log('📊 Available Systems:');
    console.log('   - Internal Workflow Registry (4 default workflows)');
    console.log('   - Internal Workflow Executor (autonomous execution)');
    console.log('   - Internal Agent Manager (Jules, Kate, Grok)');
    console.log('   - OpenTelemetry Tracing (full observability)');
    console.log('\n🎯 Everything is internal - no external dependencies!\n');

  } catch (error) {
    console.error('❌ Failed to initialize internal systems:', error);
    throw error;
  }
}

/**
 * Check if systems are initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Get initialization status
 */
export function getInitializationStatus() {
  return {
    initialized,
    systems: {
      tracing: true,
      julesManager: true,
      agentManager: initialized,
      workflowRegistry: initialized,
      workflowExecutor: initialized
    }
  };
}
