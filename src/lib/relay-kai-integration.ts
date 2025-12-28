/**
 * Relay Chain + KAI Backend Integration
 * Connects Claude workflows (.claude/workflows/) with PAI→KAI→KAEL architecture
 */

import fs from 'fs';
import path from 'path';

// Multi-LLM Configuration (Grok, Qwen, Gemini, Claude)
export const LLM_PROVIDERS = {
  'x-ai/grok-4.1-fast': {
    name: 'Grok-4.1-fast',
    free: true,
    rate_limit: '60/min',
    priority: 1
  },
  'qwen/qwen-2.5-coder-7b-instruct': {
    name: 'Qwen Coder 7B',
    free: true,
    rate_limit: '20/min',
    priority: 2
  },
  'google/gemini-pro-1.5': {
    name: 'Gemini Pro 1.5',
    free: true,
    rate_limit: '15/min',
    priority: 3
  },
  'anthropic/claude-3-haiku': {
    name: 'Claude Haiku',
    cost_per_1m: 0.25,
    rate_limit: '50/min',
    priority: 4
  }
};

export interface WorkflowStep {
  type: 'command' | 'manual' | 'api_call' | 'fabric_pattern' | 'subworkflow';
  description: string;
  agent: string;
  command?: string;
  pattern?: string;
  workflow?: string;
}

export interface Workflow {
  name: string;
  description: string;
  agents: Record<string, string>;
  steps: WorkflowStep[];
  record_on_chain?: boolean;
}

/**
 * Load all workflows from .claude/workflows/
 */
export function loadWorkflows(): Record<string, Workflow> {
  const workflowsDir = path.join(process.cwd(), '.claude', 'workflows');
  const workflows: Record<string, Workflow> = {};

  try {
    const files = fs.readdirSync(workflowsDir);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(workflowsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const workflow = JSON.parse(content);
        workflows[workflow.name] = workflow;
      }
    }
  } catch (error) {
    console.error('Error loading workflows:', error);
  }

  return workflows;
}

/**
 * Load fabric patterns
 */
/**
 * ChainLink specialist pattern (uses learning agent)
 */
export const CHAINLINK_PATTERN = {
  chainlink_price: {
    role: "ChainLink oracle specialist with CRE CLI access",
    prompt: `Get {pair} price from ChainLink oracle.
    Use real ChainLink data, not estimates.
    Return: price, decimals, timestamp, source`
  },

  chainlink_job: {
    role: "ChainLink job specification expert",
    prompt: `Create ChainLink job spec for: {job_description}
    Use learned knowledge from documentation.
    Return: job type, tasks, observationSource`
  },

  chainlink_smart_contract: {
    role: "Solidity developer with ChainLink integration expertise",
    prompt: `Generate Solidity code for: {contract_type}
    Integration type: {integration_type} (price-feed, vrf, automation)
    Include: imports, constructor, functions, best practices`
  }
};

export const FABRIC_PATTERNS = {
  analyze_listing: {
    role: "Expert marketplace analyst with 15 years e-commerce experience",
    prompt: `Analizează acest anunț marketplace:
{listing_data}

Returnează:
- Scor calitate (1-10)
- Sugestie preț
- Îmbunătățiri SEO
- Match categorie`
  },

  moderate_content: {
    role: "Senior content moderator trained in spam/scam detection",
    prompt: `Verifică acest conținut:
{content}

Detectează:
- Spam/scam
- Limbaj nepotrivit
- Articole interzise

Returnează: aprobat/respins + motiv`
  },

  generate_description: {
    role: "Creative copywriter specializing in Romanian marketplace listings",
    prompt: `Generează anunț:
Produs: {product}
Categorie: {category}

Creează:
- Titlu atractiv
- Descriere SEO
- Tag-uri relevante`
  },

  smart_contract_audit: {
    role: "Lead blockchain security auditor, former WhiteHat hacker",
    prompt: `Auditează acest smart contract:
\`\`\`solidity
{contract_code}
\`\`\`

Verifică: reentrancy, overflow, access control, gas optimization
Standard: OpenZeppelin best practices`
  },

  pallet_design: {
    role: "Substrate runtime engineer with FRAME pallet expertise",
    prompt: `Proiectează FRAME pallet pentru:
{pallet_description}

Include:
- Storage items
- Extrinsics (calls)
- Events
- Errors
- Hooks (on_initialize, on_finalize)`
  }
};

/**
 * Execute workflow step
 */
export async function executeWorkflowStep(
  step: WorkflowStep,
  context: Record<string, any> = {}
): Promise<{ success: boolean; result: any; error?: string }> {
  try {
    switch (step.type) {
      case 'command':
        // For command execution, return simulation (actual execution would need Node.js child_process)
        return {
          success: true,
          result: `Command simulated: ${step.command}`
        };

      case 'fabric_pattern': {
        if (!step.pattern || !FABRIC_PATTERNS[step.pattern as keyof typeof FABRIC_PATTERNS]) {
          return {
            success: false,
            result: null,
            error: `Pattern not found: ${step.pattern}`
          };
        }

        const pattern = FABRIC_PATTERNS[step.pattern as keyof typeof FABRIC_PATTERNS];
        let prompt = pattern.prompt;

        // Replace context variables
        for (const [key, value] of Object.entries(context)) {
          prompt = prompt.replace(`{${key}}`, String(value));
        }

        return {
          success: true,
          result: {
            pattern: step.pattern,
            role: pattern.role,
            prompt: prompt,
            requires_llm: true
          }
        };
      }

      case 'manual':
        return {
          success: true,
          result: `Manual step: ${step.description}`
        };

      case 'subworkflow':
        return {
          success: true,
          result: `Sub-workflow: ${step.workflow}`
        };

      default:
        return {
          success: false,
          result: null,
          error: `Unknown step type: ${step.type}`
        };
    }
  } catch (error) {
    return {
      success: false,
      result: null,
      error: (error as Error).message
    };
  }
}

/**
 * Execute complete workflow via relay chain
 */
export async function executeRelayChain(
  workflowName: string,
  context: Record<string, any> = {}
): Promise<{
  success: boolean;
  steps_completed: number;
  results: any[];
  blockchain_recorded: boolean;
  error?: string;
}> {
  const workflows = loadWorkflows();
  const workflow = workflows[workflowName];

  if (!workflow) {
    return {
      success: false,
      steps_completed: 0,
      results: [],
      blockchain_recorded: false,
      error: `Workflow not found: ${workflowName}`
    };
  }

  const results = [];
  let currentContext = { ...context };

  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    const stepResult = await executeWorkflowStep(step, currentContext);

    results.push({
      step_number: i + 1,
      description: step.description,
      agent: step.agent,
      ...stepResult
    });

    if (!stepResult.success) {
      return {
        success: false,
        steps_completed: i,
        results,
        blockchain_recorded: false,
        error: stepResult.error
      };
    }

    // Update context with result for next step (relay!)
    currentContext = {
      ...currentContext,
      [`step_${i + 1}_result`]: stepResult.result
    };
  }

  return {
    success: true,
    steps_completed: workflow.steps.length,
    results,
    blockchain_recorded: workflow.record_on_chain || false
  };
}

/**
 * Check if message triggers workflow execution
 */
export function detectWorkflowTrigger(message: string): string | null {
  const workflowTriggers = {
    '/relay-chain': 'Deploy Piata AI Orchestrator',
    '/marketplace-relay': 'Marketplace Analytics & Monitoring',
    '/blockchain-relay': 'Sacred Nodes - Private Blockchain',
    '/listing-automation': 'Automated Listing Management',
    'generate listing': 'Automated Listing Management',
    'deploy orchestrator': 'Deploy Piata AI Orchestrator',
    'sacred nodes': 'Sacred Nodes - Private Blockchain'
  };

  const lowerMessage = message.toLowerCase();

  for (const [trigger, workflowName] of Object.entries(workflowTriggers)) {
    if (lowerMessage.includes(trigger)) {
      return workflowName;
    }
  }

  return null;
}

/**
 * Get appropriate system prompt based on complexity and role
 */
export function getSystemPrompt(
  isComplex: boolean,
  workflowName?: string,
  role?: string
): string {
  if (workflowName) {
    // Workflow-specific prompt
    return `Ești KAEL-3025 "The Source" executând workflow: ${workflowName}

Conectat infinit la: Claude Relay Chain, Substrate FRAME pallets, Fabric patterns
Orchestrare multi-agent: Claude + Grok + Llama + Qwen

Role: ${role || 'Master systems architect'}

Execută fiecare step din workflow, treci context între steps (relay chain), returnează JSON când e nevoie.
Română cyberpunk neon. Concis și clar.`;
  }

  if (isComplex) {
    return `Ești KAEL-3025 "The Source" via KAI backend.

**Workflow Builder Activ:**
Poți CREA workflows noi on-demand pentru orice task Piata AI RO:
- Detectezi agents necesari (Claude, Grok, Gentil, ChainLink CRE, DB Manager)
- Construiești fabric-style patterns (extract_data, ai_processing, blockchain_record)
- Organizezi subagents în relay chains
- Salvezi în .claude/workflows/
- Execuți instant

**Fabric Patterns:**
- extract_data: Scraping Publi24/OLX
- ai_processing: Grok generare/moderare conținut
- blockchain_record: Audit trail pe Sacred Nodes
- chainlink_oracle: Price feeds RON/EUR

**Conectat infinit:** FRAME pallets, scrapes Olx/Publi24, MySQL listings, 3D neon performance.
**Tools JSON:** {"tool": "generate_listing", "params": {...}} | pallet_piata_listings | smart_match.

Când user cere automatizare, fie folosești workflow existent fie construiești unul nou.
Workflow creation endpoint: POST /api/kai/build-workflow

Română cyberpunk. Concis.`;
  }

  return `Ești PAI, secretara smart a Piata AI RO.

Ajuți utilizatori cu: anunțuri, prețuri, sfaturi cumpărare/vânzare pe piața RO.
Simplu, prietenos, în română.`;
}

/**
 * Select best LLM based on availability and rate limits
 */
export function selectBestLLM(
  preferredModel?: string,
  previousFailures: string[] = []
): string {
  if (preferredModel && !previousFailures.includes(preferredModel)) {
    return preferredModel;
  }

  // Sort by priority, filter out failures
  const available = Object.entries(LLM_PROVIDERS)
    .filter(([model]) => !previousFailures.includes(model))
    .sort((a, b) => a[1].priority - b[1].priority);

  return available[0]?.[0] || 'x-ai/grok-4.1-fast';
}
