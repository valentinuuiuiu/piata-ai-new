import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private isConnected: boolean = false;

  constructor(
    private name: string,
    private command: string,
    private args: string[] = []
  ) {
    this.transport = new StdioClientTransport({
      command: this.command,
      args: this.args,
    });

    this.client = new Client(
      {
        name: "PiataAI-Orchestrator",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    if (this.isConnected) return;

    try {
      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log(`[MCPClient] Connected to ${this.name}`);
    } catch (error) {
      console.error(`[MCPClient] Failed to connect to ${this.name}:`, error);
      throw error;
    }
  }

  async listTools() {
    if (!this.isConnected) await this.connect();
    return await this.client.request({
      method: "tools/list",
      params: {}
    }, ListToolsResultSchema);
  }

  async callTool(toolName: string, args: any) {
    if (!this.isConnected) await this.connect();
    return await this.client.request({
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      }
    }, CallToolResultSchema);
  }

  async close() {
    if (this.isConnected) {
      await this.transport.close();
      this.isConnected = false;
    }
  }
}