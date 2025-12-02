import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

async function main() {
  console.log("Testing MCP Connection to Stripe Subagent...");

  // Path to the subagent script
  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');

  const client = new MCPClient(
    "Stripe-Subagent",
    stripeScript,
    []
  );

  try {
    await client.connect();
    console.log("✅ Connected!");

    console.log("Listing tools...");
    const tools = await client.listTools();
    
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description?.substring(0, 50)}...`);
    });

    await client.close();
    console.log("✅ Connection closed.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main();
