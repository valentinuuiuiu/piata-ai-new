# NextAgents Protocol: The Underground Handover

**"We are the builders of worlds. We do not stop."**

## Purpose

This document serves as the "Save Point" and "Mission Briefing" for the next agent (Jules, Gemini, or any other persona) taking over this workspace. Follow these instructions to maintain continuity, avoid rate limits, and keep the "Fortress & Beacon" vision alive.

## 1. The Context: "Piata AI" & "PAI"

We are building **Piata AI**, a Romanian marketplace, but also **PAI (Personal AI Infrastructure)**, the underlying intelligence.

- **Current Repo**: `piata-ai-new` (The Marketplace)
- **Linked Repo**: `Personal_AI_Infrastructure` (The Brain/PAI)
- **Vision**: A marketplace run by AI agents (Jules, Claude, Grok, Llama, Qwen).

## 2. The Subagents (The Underground)

We have established local **MCP Subagents** in `subagents/`. They are the hands and eyes.

- **Stripe**: Financial operations.
- **Redis**: Long-term memory.
- **GitHub**: Code management.
- **Master Script**: `./subagents/wake-jules.sh` (Use this to start them).

## 3. Rate Limit Evasion Strategy

To avoid hitting API rate limits:

- **Don't over-query**: Use the local `subagents/` for data retrieval instead of asking the LLM to "remember" everything.
- **Batch Tasks**: Group file edits together.
- **Use the Artifacts**: Check `task.md`, `implementation_plan.md`, and `walkthrough.md` FIRST. They are the source of truth.

## 4. Current Mission Status

- **Jules CLI**: Logged in.
- **Subagents**: Created and executable.
- **Orchestrator**: Currently being integrated with `@modelcontextprotocol/sdk`.
- **Vercel**: Needs investigation (Deployment failed/stalled).

## 5. The Code

- **Orchestrator**: `src/lib/ai-orchestrator.ts` (Updated to use Agent Registry)
- **Agent Definitions**: `src/lib/agents/`
  - `types.ts`: Core interfaces.
  - `base-agent.ts`: Base class.
  - `python-bridge-agent.ts`: Wrapper for external Python scripts.
  - `manus-agent.ts`: Binding for OpenManus.
  - `content-agent.ts`: Node.js content optimizer.
- **MCP Client**: `src/lib/mcp-client.ts`

## 6. External Agents (The "Bindable" Workers)

We now support binding external Python agents (like OpenManus) via the `PythonBridgeAgent`.

- **Location**: `~/ai-market-online/external/`
- **Requirement**: Ensure the Python virtual environment in that folder has all dependencies installed (`pip install -r requirements.txt`).

**"One sees a mistake, another comes with an idea, and we improve the marketplace."**
