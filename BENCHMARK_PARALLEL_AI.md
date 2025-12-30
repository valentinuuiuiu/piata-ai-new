# Task: Parallel AI Benchmark for Qwen

## Challenge

Replicate the core capabilities of [Parallel AI](https://parallel.ai/) using our "Sacred Node" (Jules/Antigravity infrastructure).

## Components to Build

1.  **"Parallel Search" MCP**: Create a search tool optimized for _agents_ (not humans).
    - Prioritize JSON output, evidence citation, and speed.
    - Integration: Add to `UniversalDBManager` or create a dedicated `SearchManager`.
2.  **"Deep Research" Agent**: An agent that performs multi-step research.
    - Synthesize info from multiple sources.
    - Output structured reports.
3.  **"AI Employee" Workflow**:
    - Automate a specific business workflow (e.g., "Lead Qualification" or "Content Marketing") completely autonomously.
    - Use Jules to orchestrate this.

## Success Metrics (The Benchmark)

- [ ] **Speed**: Query to JSON result < 2s.
- [ ] **Accuracy**: Fact-check against known sources.
- [ ] **Autonomy**: Zero human intervention during the "Employee" workflow.

## Handoff

- [ ] Update `HANDOFF_TO_QWEN.md` with these extra challenges.
