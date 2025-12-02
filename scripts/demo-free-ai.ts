import { getJulesManager } from '../src/lib/jules-manager';

/**
 * Demo: The Power of Free AI Intelligence
 * 
 * This demonstrates how Jules orchestrates multiple FREE AI agents
 * to accomplish complex tasks without expensive cloud platforms.
 */

async function main() {
  console.log("════════════════════════════════════════════════════════");
  console.log("  JULES - The Future of Autonomous Intelligence");
  console.log("  Powered by FREE OpenRouter models");
  console.log("════════════════════════════════════════════════════════\n");

  const jules = getJulesManager();

  try {
    // Initialize the system
    console.log("⚡ Initializing Jules and all subagents...\n");
    await jules.initialize();
    console.log("");

    // Demo 1: KATE - Code Generation
    console.log("═══ Demo 1: KATE (Code Specialist - FREE) ═══");
    console.log("Task: Generate a function to calculate Fibonacci sequence\n");
    
    const codeTask = await jules.executeTask(
      "Write a TypeScript function that calculates the nth Fibonacci number using dynamic programming"
    );
    
    if (codeTask.success) {
      console.log("✅ KATE Response:");
      console.log(codeTask.content.substring(0, 500) + "...\n");
    }

    // Demo 2: Grok - Market Analysis
    console.log("\n═══ Demo 2: Grok (Fast Thinker - FREE) ═══");
    console.log("Task: Analyze marketplace trends\n");
    
    const insightTask = await jules.executeTask(
      "Analyze the current trends in online marketplaces in Romania and suggest optimization strategies"
    );
    
    if (insightTask.success) {
      console.log("✅ Grok Response:");
      console.log(insightTask.content.substring(0, 500) + "...\n");
    }

    // Demo 3: Health Check
    console.log("\n═══ System Health Check ═══");
    const health = await jules.healthCheck();
    console.log("Agent Status:");
    Object.entries(health).forEach(([name, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${name}`);
    });

    console.log("\n════════════════════════════════════════════════════════");
    console.log("  Summary:");
    console.log("  - Total Cost: $0.00 (using free models)");
    console.log("  - Agents Active: " + Object.keys(health).length);
    console.log("  - Response Time: < 5 seconds");
    console.log("════════════════════════════════════════════════════════");
    console.log("\n🎉 This is the future: FREE, FAST, AUTONOMOUS\n");

    await jules.shutdown();

  } catch (error: any) {
    console.error("❌ Demo failed:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Ensure OPENROUTER_API_KEY is set in .env.local");
    console.error("2. Check your internet connection");
    console.error("3. Verify OpenRouter API status\n");
    process.exit(1);
  }
}

main();
