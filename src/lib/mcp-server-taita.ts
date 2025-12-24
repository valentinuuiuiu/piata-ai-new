#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { piataAgent } from "./piata-agent";

/**
 * Taita MCP Server
 * Allows RooCode (Minimax) to communicate directly with the Piata AI Agent Swarm.
 */
const server = new Server(
  {
    name: "taita-orchestrator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "consult_taita",
        description: "Ask Taita (The Architect Agent) to perform a task or provide wisdom.",
        inputSchema: {
          type: "object",
          properties: {
            request: {
              type: "string",
              description: "The request, command, or question for Taita.",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "The priority of the request.",
            },
          },
          required: ["request"],
        },
      },
      {
        name: "get_agent_status",
        description: "Get the current status of all active agents in the swarm.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "optimize_listing",
        description: "Tangible Command: Optimize a specific marketplace listing using AI.",
        inputSchema: {
          type: "object",
          properties: {
            listingId: {
              type: "number",
              description: "The ID of the listing to optimize.",
            },
          },
          required: ["listingId"],
        },
      },
    ],
  };
});

// Import automation engine dynamically to avoid circular deps if any, or just use it
import { automationEngine } from "./automation-engine";

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "optimize_listing": {
      const { listingId } = request.params.arguments as any;
      try {
        const result = await automationEngine.optimizeListingById(Number(listingId));
        return {
          content: [
            {
              type: "text",
              text: `Listing #${listingId} optimized successfully.\nOriginal Title: ${result.original.title}\nNew Title: ${result.optimized.title}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to optimize listing #${listingId}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "consult_taita": {
      const { request: taskDescription, priority = "medium" } = request.params.arguments as any;
      
      piataAgent.tellStory("The Handshake", `RooCode (Minimax) requests: "${taskDescription}"`, "Taita");
      
      // Create and execute the task
      const taskId = await piataAgent.createTask(taskDescription, priority);
      
      // For immediate feedback, we'll try to execute it now (or wait for the loop)
      // In this sync context, we'll just acknowledge receipt
      
      return {
        content: [
          {
            type: "text",
            text: `Taita has received your request. Task ID: ${taskId}. The swarm is moving.`,
          },
        ],
      };
    }

    case "get_agent_status": {
      const tasks = piataAgent.getTasks();
      const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      
      return {
        content: [
          {
            type: "text",
            text: `Swarm Status:\n- Active Tasks: ${activeTasks}\n- Pending Tasks: ${pendingTasks}\n- Active Agents: Taita, Manus, Phitagora, Sinuhe, Vetala, Ay`,
          },
        ],
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Taita MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
