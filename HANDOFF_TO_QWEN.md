# Handoff Briefing: Universal DB MCP Implementation

**To**: Qwen Agent
**From**: Antigravity (Gemini)
**Date**: 2025-12-30
**Subject**: Implementation of Universal DB MCP Tool

## Context

We are creating a "Universal DB" MCP tool that allows for dynamic definition of database tools (parameterized SQL) similar to the Google GenAI Toolbox. This needs to be integrated into `JulesManager`.

## Resources

- **Plan**: `IMPLEMENTATION_PLAN_UNIVERSAL_DB.md` (Already created in root)
- **Ref**: `JULES_MANUAL.md`, `src/lib/jules-manager.ts`
- **Qwen's Worktree**: `worktree-2025-12-25T21-55-36` (This is your previous worktree/context).

## Analysis of Qwen's Worktree (`worktree-2025-12-25T21-55-36`)

I have reviewed `COMPLETE_JULES_SYSTEM.md` from your previous session.

- **Status**: **PRODUCTION READY**
- **Existing Capabilities**:
  - `SupabaseManager` and `StripeAgent` are ALREADY implemented and tested.
  - `get_credit_packages`, `get_user_credits`, `process_stripe_webhook` are DONE.
- **Instruction**: Do NOT rebuild these. **MERGE** them into the current main branch if they are missing. Your "Universal DB" tool should be an _addition_ to this existing solid foundation.

## Instructions for Qwen

1.  **Read the Plan**: Review `IMPLEMENTATION_PLAN_UNIVERSAL_DB.md` carefully.
2.  **Create Manager**: Implement `src/lib/universal-db-mcp.ts`.
    - Use `pg` (node-postgres) for connections.
    - Implement method `executeTool(toolName, args)`.
3.  **Create Config**: Create `universal-db-config.json` with at least one sample tool (e.g., `check_db_version` or `search_users`).
4.  **Integrate**: Modify `src/lib/jules-manager.ts`:
    - Import and initialize `UniversalDBManager`.
    - Add routing logic in `executeTask` to delegate DB-related queries to this new manager.
    - **CRITICAL**: Ensure all calls are logged via `a2aSignalManager` for surveillance.

## 5. (Immediate) Security Fix

I reviewed the `gemini-extension.json`. **It contains hardcoded API keys.**

- **Action**: Move all keys (Stripe, GitHub, Supabase) to `.env.local` or `.env`.
- **Action**: Update `gemini-extension.json` to use environment variables (e.g., `"${STRIPE_SECRET_KEY}"`).
- **Action**: Address the `.gitignore` rule for `gemini_extension/` if intended for version control.

## 6. (The Test) Parallel AI Benchmark

The user wants to test your true power. After completing the Universal DB, you must attempt to replicate features from **Parallel AI**:

1.  **Agentic Search Tool**: Create a search tool that mimics "Parallel Search API" (high accuracy, JSON output for agents).
2.  **"Deep Research" Capability**: Use Jules + your new tools to perform a multi-step research task (e.g., "Find all competitors to Piata AI and their pricing") and save it to the DB.
3.  **Prove it**: The user said "our sacred node can build any of this". Prove them right.

## Goal

Enable Jules to execute dynamic SQL tools safely, SECURE the infrastructure, and crush the Parallel AI benchmark.

_End of Brief_
