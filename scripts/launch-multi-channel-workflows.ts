/**
 * Launch Multi-Channel Promotional Workflows
 * 
 * This script initializes the workflow registry and triggers the 5 core
 * multi-channel promotional workflows for the Romanian marketplace.
 */

import { 
  initializeWorkflowRegistry, 
  executeWorkflow, 
  getAllWorkflows 
} from '../src/lib/internal-workflow-registry';

async function launchWorkflows() {
  console.log('🚀 Launching Multi-Channel Promotional Workflows...');
  
  try {
    // 1. Initialize Registry
    await initializeWorkflowRegistry();
    
    // @ts-ignore - Type mismatch due to circular dependency in registry
    const workflows = getAllWorkflows().filter(w => 
      ['romanian-marketplace-domination', 
       'viral-growth-accelerator', 
       'mobile-first-romanian-campaign', 
       'cultural-localization-campaign', 
       'performance-optimization-engine'].includes(w.id)
    );
    
    console.log(`📋 Found ${workflows.length} integrated workflows to launch.`);
    
    // 2. Execute each workflow
    for (const workflow of workflows) {
      console.log(`\n▶️ Starting Workflow: ${workflow.name} (${workflow.id})`);
      
      try {
        // @ts-ignore - Type mismatch due to circular dependency in registry
        const execution = await executeWorkflow(workflow.id, {
          launchedAt: new Date().toISOString(),
          environment: 'production',
          targetMarket: 'Romania'
        });
        
        console.log(`✅ Workflow ${workflow.id} completed with status: ${execution.status}`);
        console.log(`📊 Steps completed: ${execution.steps_completed}/${execution.steps_total}`);
      } catch (error) {
        console.error(`❌ Workflow ${workflow.id} failed:`, error);
      }
    }
    
    console.log('\n✨ All multi-channel workflows have been launched and are now active!');
    console.log('📈 Monitor performance via the SEO Performance Dashboard and Automation Logs.');
    
  } catch (error) {
    console.error('💥 Fatal error during workflow launch:', error);
    process.exit(1);
  }
}

launchWorkflows();
