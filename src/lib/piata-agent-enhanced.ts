/**
 * Enhanced Piata Agent Integration
 * Implements the A2A Protocol for autonomous agent behavior
 */

import { a2aSignalManager, A2ASignalData } from './a2a/signal-manager';
import { OpenRouterAgent } from './openrouter-agent';
import { db } from './drizzle/db';
import { a2aSignals } from './drizzle/a2a-schema';
import { eq, and } from 'drizzle-orm';
import { withSpan, recordEvent } from './tracing';
import { GitTools } from './agents/tools/git-tools';

// --- CONFIGURATION ---
const AGENT_MODEL = "mistralai/mistral-large-2411"; // Powerful model for reasoning

export interface AgentAction {
  type: 'reply' | 'broadcast' | 'execute_tool' | 'ignore';
  content?: any;
  toolName?: string;
  toolParams?: any;
  reasoning: string;
}

export class EnhancedPiataAgent {
  private agentName: string;
  private llm: OpenRouterAgent;
  private isProcessing: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private tools: string[] = [];

  constructor(agentName: string, systemPrompt?: string, tools: string[] = []) {
    this.agentName = agentName;
    this.tools = tools;

    let toolsDescription = '';
    if (tools.includes('git_ops')) {
        toolsDescription += `
    AVAILABLE TOOLS:
    - git_log(limit?: number): View recent git commit history.
    - git_status(): Check current git status.
    - list_files(path?: string): List files in the repository.
    - read_file(filepath: string): Read content of a file.
    - create_file(filepath: string, content: string): Create a new file.
    - apply_patch(filepath: string, patchContent: string): Overwrite file with new content.
        `;
    }

    const defaultPrompt = `You are ${agentName}, an autonomous agent in the Piata AI ecosystem.
    You communicate via the A2A (Agent-to-Agent) Protocol.

    Your goal is to process signals sent to you, understand the intent, and decide on the best course of action.
    ${toolsDescription}

    You can:
    1. Reply to the sender.
    2. Broadcast a message to all agents.
    3. Execute a tool from the list above (if available).
    4. Ignore irrelevant signals.

    Always provide reasoning for your actions.`;

    this.llm = new OpenRouterAgent(AGENT_MODEL, systemPrompt || defaultPrompt);
  }

  /**
   * Start the agent loop
   */
  start(intervalMs: number = 10000) {
    console.log(`🚀 [${this.agentName}] Starting agent loop...`);
    // Register agent in registry
    a2aSignalManager.updateAgentRegistry(this.agentName, {
      agentType: 'internal',
      status: 'healthy',
      capabilities: ['reasoning', 'a2a_communication']
    });

    this.pollingInterval = setInterval(() => this.processPendingSignals(), intervalMs);
  }

  /**
   * Stop the agent loop
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    console.log(`🛑 [${this.agentName}] Agent loop stopped.`);
  }

  /**
   * Process pending signals addressed to this agent
   */
  async processPendingSignals() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Fetch pending signals
      const signals = await a2aSignalManager.getSignals({
        status: ['pending'],
        agents: [this.agentName] // Addressed to me or broadcast
      });

      // Filter for signals where I am the 'toAgent' or it is a broadcast (toAgent is null)
      // Note: getSignals does a broad OR check, so we filter strictly here
      const mySignals = signals.filter(s =>
        (s.toAgent === this.agentName || s.toAgent === null) &&
        s.fromAgent !== this.agentName // Don't process my own signals
      );

      if (mySignals.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`📥 [${this.agentName}] Found ${mySignals.length} new signals.`);

      for (const signal of mySignals) {
        await this.handleSignal(signal);
      }

    } catch (error) {
      console.error(`❌ [${this.agentName}] Error processing signals:`, error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Handle a single signal with LLM reasoning
   */
  private async handleSignal(signal: any) {
    return withSpan(`agent.${this.agentName}.handle_signal`, async () => {
      console.log(`👀 [${this.agentName}] Processing signal ${signal.id} from ${signal.fromAgent}`);

      // Update status to processing
      await a2aSignalManager.updateSignalStatus(signal.id, 'processing');

      // 2. Ask LLM what to do
      const prompt = `
        INCOMING SIGNAL:
        From: ${signal.fromAgent}
        Type: ${signal.signalType}
        Content: ${JSON.stringify(signal.content)}

        Decide your action.
        Return a JSON object with this structure:
        {
          "type": "reply" | "broadcast" | "execute_tool" | "ignore",
          "content": "Message content or tool output",
          "toolName": "name_of_tool_if_type_is_execute_tool",
          "toolParams": { ... },
          "reasoning": "Why you chose this action"
        }
      `;

      try {
        const response = await this.llm.execute(prompt, { temperature: 0.2, max_tokens: 1000 });

        if (!response.success) {
          throw new Error(`LLM failed: ${response.error}`);
        }

        const action = this.parseAction(response.content);
        console.log(`🤔 [${this.agentName}] Decided to: ${action.type} (${action.reasoning})`);

        // 3. Execute Action
        await this.executeAction(action, signal);

        // 4. Mark signal as completed
        await a2aSignalManager.updateSignalStatus(signal.id, 'completed');

        // 5. Log learning history
        await a2aSignalManager.logAgentInteraction({
          fromAgent: signal.fromAgent,
          toAgent: this.agentName,
          interactionType: 'response',
          taskId: signal.content?.task?.id,
          outcome: 'success',
          context: { actionType: action.type, reasoning: action.reasoning }
        });

      } catch (error: any) {
        console.error(`❌ [${this.agentName}] Failed to handle signal ${signal.id}:`, error);
        await a2aSignalManager.updateSignalStatus(signal.id, 'failed', error.message);
      }
    });
  }

  private parseAction(jsonStr: string): AgentAction {
    try {
      // Clean potential markdown code blocks
      const cleanJson = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse LLM JSON:", jsonStr);
      return { type: 'ignore', reasoning: 'Failed to parse LLM response' };
    }
  }

  private async executeAction(action: AgentAction, originalSignal: any) {
    switch (action.type) {
      case 'reply':
        await a2aSignalManager.logSignal({
          signalType: 'REPLY',
          fromAgent: this.agentName,
          toAgent: originalSignal.fromAgent,
          content: { message: action.content },
          priority: 'normal'
        });
        break;

      case 'broadcast':
        await a2aSignalManager.broadcastEnhanced(
          'AGENT_BROADCAST',
          { message: action.content },
          this.agentName
        );
        break;

      case 'execute_tool':
        console.log(`🛠️ [${this.agentName}] Executing tool: ${action.toolName}`, action.toolParams);

        let toolOutput = '';
        try {
            switch(action.toolName) {
                case 'git_log':
                    toolOutput = await GitTools.getGitLog(action.toolParams?.limit);
                    break;
                case 'git_status':
                    toolOutput = await GitTools.getGitStatus();
                    break;
                case 'list_files':
                    toolOutput = await GitTools.listFiles(action.toolParams?.path);
                    break;
                case 'read_file':
                    toolOutput = await GitTools.getFileContent(action.toolParams?.filepath);
                    break;
                case 'create_file':
                    if (this.tools.includes('git_ops')) {
                        toolOutput = await GitTools.createFile(action.toolParams?.filepath, action.toolParams?.content);
                    } else {
                        toolOutput = 'Error: Permission denied for create_file.';
                    }
                    break;
                case 'apply_patch':
                    if (this.tools.includes('git_ops')) {
                        toolOutput = await GitTools.applyPatch(action.toolParams?.filepath, action.toolParams?.patchContent);
                    } else {
                        toolOutput = 'Error: Permission denied for apply_patch.';
                    }
                    break;
                default:
                    toolOutput = `Error: Tool '${action.toolName}' not found.`;
            }
        } catch (err: any) {
            toolOutput = `Error executing tool: ${err.message}`;
        }

        const result = { success: true, output: toolOutput };

        // Reply with result
        await a2aSignalManager.logSignal({
          signalType: 'TOOL_RESULT',
          fromAgent: this.agentName,
          toAgent: originalSignal.fromAgent,
          content: { result, originalTask: originalSignal.content },
          priority: 'high'
        });
        break;

      case 'ignore':
      default:
        // Do nothing
        break;
    }
  }
}
