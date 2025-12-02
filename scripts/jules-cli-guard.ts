import { getJulesManager } from '../src/lib/jules-manager';

async function runGuardRail() {
  const julesManager = getJulesManager();

  console.log('Initializing Jules Manager...');
  await julesManager.initialize();
  console.log('Jules Manager initialized.');

  console.log('Running health check on all subagents...');
  const healthStatus = await julesManager.healthCheck();

  console.log('\n--- Subagent Health Status ---');
  for (const [agentName, isHealthy] of Object.entries(healthStatus)) {
    console.log(`${agentName}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  }
  console.log('----------------------------\n');

  // Optionally, perform a sample task to test functionality
  try {
    console.log('Attempting to execute a sample task ("optimize code")...');
    const codeTaskResult = await julesManager.executeTask('optimize code for performance');
    console.log('Sample code optimization task result:', codeTaskResult);
  } catch (error) {
    console.error('Error executing sample code optimization task:', error);
  }

  // Shut down the manager (important for clean exit of child processes)
  await julesManager.shutdown();
  console.log('Jules Manager shut down.');
}

runGuardRail().catch(error => {
  console.error('Guard-rail script failed:', error);
  process.exit(1);
});
