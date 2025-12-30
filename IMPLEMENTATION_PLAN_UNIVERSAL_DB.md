# Universal DB MCP Tool Implementation Plan

## Goal

Create a "Universal DB" MCP tool for Jules/Antigravity that allows for dynamic definition of database tools (parameterized SQL) similar to the Google GenAI Toolbox, but integrated directly into our TypeScript environment.

## Proposed Changes

### 1. Create Universal DB MCP Manager

#### [NEW] [src/lib/universal-db-mcp.ts](file:///home/shiva/piata-ai-new/src/lib/universal-db-mcp.ts)

- Implement a `UniversalDBManager` class.
- Support configuration of "Sources" (DB connections) and "Tools" (SQL templates).
- Use `pg` (node-postgres) for generic Postgres connections (or reuse Supabase client if applicable, but `pg` is more "universal").
- Implement `executeTool(toolName, args)` logic that interpolates arguments into SQL.

### 2. Configuration

#### [NEW] [universal-db-config.json](file:///home/shiva/piata-ai-new/universal-db-config.json)

- Define initial tools (e.g., `search_users`, `get_active_listings`) using the Toolbox-style YAML/JSON structure.

### 3. Integrate with Jules

#### [MODIFY] [src/lib/jules-manager.ts](file:///home/shiva/piata-ai-new/src/lib/jules-manager.ts)

- Initialize `UniversalDBManager`.
- Add routing logic to direct relevant queries to this manager.
- Add A2A logging.

## Verification Plan

### Automated Verification

- Create `scripts/test-universal-db.ts` to:
  1. Initialize the manager with a test config.
  2. Mock the DB connection (or use the existing Supabase dev DB).
  3. Execute a defined tool and verify the SQL generation/result.

### Manual Verification

- Run `scripts/jules-cli-guard.ts` to verify the new agent appears in health checks.
