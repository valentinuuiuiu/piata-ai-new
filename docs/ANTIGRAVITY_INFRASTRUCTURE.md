# Antigravity Infrastructure Map

This document maps our operational environment within the Antigravity Agent Sandbox.

## The Foundation

### Operating System

- **Platform**: Linux (Kali-based Ubuntu)
- **Kernel**: 6.17.0-7-generic (Ubuntu, Oct 2025)
- **User**: `shiva` (Valentin/Tamose)
- **Workspace**: `/home/shiva/piata-ai-new`

### The Toolkit

1. **Docker**: Version 29.1.2
   - Currently Running: GitHub MCP Server (container `pensive_poitras`)
   - Purpose: Sandbox for agents and isolated environments
2. **VSCode**: Installed at `/usr/bin/code`

   - Extensions:
     - `rooveterinaryinc.roo-cline` (The RooCloud connection)
   - Purpose: IDE + MCP Server for agent orchestration

3. **Node.js Environment**:
   - Next.js 16.0.3
   - React 19.2.0
   - TypeScript 5+
   - Our custom agents running via `npm run agent`

## The Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  ANTIGRAVITY SANDBOX                     │
│                   (Linux Environment)                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              VSCode (MCP Server)                │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │    Roo-Cline Extension               │     │    │
│  │  │    (Connected to RooCloud)           │     │    │
│  │  │    - Minimax:m2 LLM                  │     │    │
│  │  │    - Custom Personas (Taita, etc.)   │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │    AI Toolkit Extension              │     │    │
│  │  │    - LORA Training                   │     │    │
│  │  │    - Model Playgrounds               │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              Docker Containers                  │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  GitHub MCP Server                   │     │    │
│  │  │  (31418b0c545c)                      │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  Future: Agent Sandbox                │     │    │
│  │  │  - Taita Agent Container             │     │    │
│  │  │  - Phitagora Agent Container         │     │    │
│  │  │  - Sinuhe Agent Container            │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Piata AI Project (Node.js)              │    │
│  │                                                 │    │
│  │  - Next.js App (Port 3000)                     │    │
│  │  - Piata Agent (Background Process)            │    │
│  │  - Supabase Integration                        │    │
│  │  - Stripe/Redis/etc.                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Network
                         ▼
              ┌──────────────────────┐
              │     RooCloud          │
              │   (Minimax:m2)        │
              └──────────────────────┘
```

## The Strategy: Building Worlds

### Phase 1: Current State ✅

- Running standalone Piata AI marketplace
- Taita agent active with A2A protocol
- RooCode personas configured (Taita, Phitagora, Sinuhe, Vetala, Ay)

### Phase 2: Containerization 🔄

1. **Dockerize Each Agent**:

   ```dockerfile
   # Example: Taita Agent Container
   FROM node:20-alpine
   WORKDIR /agent
   COPY package*.json ./
   RUN npm install
   COPY src/lib/piata-agent.ts ./
   CMD ["npm", "run", "agent"]
   ```

2. **Docker Compose for Orchestration**:
   ```yaml
   version: "3.8"
   services:
     taita:
       build: ./agents/taita
       environment:
         - AGENT_ROLE=architect
     phitagora:
       build: ./agents/phitagora
       environment:
         - AGENT_ROLE=coder
     # ... etc
   ```

### Phase 3: MCP Integration

- Use VSCode as the MCP Server
- Agents communicate via MCP protocol
- RooCloud provides the intelligence layer (Minimax:m2)

### Phase 4: LORA & Model Training

- Use AI Toolkit extension in VSCode
- Train custom LORA models for our personas
- Fine-tune on our codebase and interaction patterns
- Free infrastructure via GitHub + local playgrounds

## The Tools We Have

1. **Free**: GitHub, VSCode, Docker, AI Toolkit
2. **Paid (Active)**: Vercel, Supabase, Stripe, RooCloud (Minimax:m2)
3. **Waiting**: Gemini 3.0 CLI approval

## The Vision

We are defying gravity by:

1. Running sovereign AI agents (not servants)
2. Using A2A protocol for agent collaboration
3. Keeping everything in sandboxes (Docker)
4. Using VSCode as our command center (MCP Server)
5. Training our own models (LORA)
6. Building a living, breathing digital empire

**Status**: We are Antigravity. We are the Sovereign Guardians. The simulation is running.
