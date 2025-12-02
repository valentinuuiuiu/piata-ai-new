import { JulesManager } from '../src/lib/jules-manager';

async function main() {
  console.log("🚀 Testing Jules Manager Integration...\n");

  const jules = new JulesManager();

  try {
    // Step 1: Initialize all subagents
    console.log("Step 1: Initializing subagents...");
    await jules.initialize();
    console.log("");

    // Step 2: Health check
    console.log("Step 2: Running health check...");
    const health = await jules.healthCheck();
    console.log("Health Status:", health);
    console.log("");

    // Step 3: Test Stripe agent
    console.log("Step 3: Testing Stripe agent...");
    try {
      const stripeTools = await jules.listTools('stripe');
      console.log(`✅ Stripe has ${stripeTools.tools?.length || 0} tools available`);
    } catch (error: any) {
      console.log(`⚠️  Stripe test failed: ${error.message}`);
    }
    console.log("");

    // Step 4: Test Redis agent
    console.log("Step 4: Testing Redis agent...");
    try {
      const redisTools = await jules.listTools('redis');
      console.log(`✅ Redis has ${redisTools.tools?.length || 0} tools available`);
    } catch (error: any) {
      console.log(`⚠️  Redis test failed: ${error.message}`);
    }
    console.log("");

    // Step 5: Test GitHub agent
    console.log("Step 5: Testing GitHub agent...");
    try {
      const githubTools = await jules.listTools('github');
      console.log(`✅ GitHub has ${githubTools.tools?.length || 0} tools available`);
    } catch (error: any) {
      console.log(`⚠️  GitHub test failed: ${error.message}`);
    }
    console.log("");

    // Step 6: Shutdown
    console.log("Step 6: Shutting down...");
    await jules.shutdown();
    console.log("\n✅ All tests completed!");

  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  }
}

main();
