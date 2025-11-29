import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * KAI Workflow Builder - Create new .claude workflows on demand
 * Fabric-style patterns for any job needed
 */

interface WorkflowRequest {
  name: string;
  description: string;
  job_description: string;
  agents?: Record<string, string>;
  patterns?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, job_description, agents, patterns } = await req.json() as WorkflowRequest;

    // Auto-detect required agents based on job type
    const detectedAgents = detectRequiredAgents(job_description);
    const finalAgents = agents || detectedAgents;

    // Build workflow steps using fabric-style patterns
    const steps = await buildWorkflowSteps(job_description, finalAgents, patterns);

    // Create workflow JSON
    const workflow = {
      name,
      description,
      agents: finalAgents,
      steps,
      created_by: 'KAI-Builder',
      created_at: new Date().toISOString(),
      record_on_chain: detectBlockchainNeed(job_description)
    };

    // Save to .claude/workflows/
    const workflowsDir = path.join(process.cwd(), '.claude', 'workflows');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filePath = path.join(workflowsDir, `${slug}.json`);

    fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));

    return NextResponse.json({
      success: true,
      workflow,
      path: filePath,
      message: `✅ Workflow "${name}" created! Execute with: /relay-chain or trigger via KAI chat.`
    });

  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      message: '❌ Workflow creation failed'
    }, { status: 500 });
  }
}

/**
 * Detect required agents based on job keywords
 */
function detectRequiredAgents(jobDescription: string): Record<string, string> {
  const agents: Record<string, string> = {
    'claude': 'Claude Code - Main orchestrator'
  };

  const keywords = jobDescription.toLowerCase();

  if (keywords.includes('scrape') || keywords.includes('data')) {
    agents['gentil'] = 'Gentil Scraper - Web scraping specialist';
  }

  if (keywords.includes('ai') || keywords.includes('generate') || keywords.includes('moderate')) {
    agents['grok'] = 'Grok-4.1-fast - AI content generation';
  }

  if (keywords.includes('blockchain') || keywords.includes('contract') || keywords.includes('validator')) {
    agents['kael'] = 'KAEL-3025 - Smart contract specialist';
  }

  if (keywords.includes('chainlink') || keywords.includes('oracle') || keywords.includes('price feed')) {
    agents['chainlink_cre'] = 'ChainLink CRE specialist - Oracle integration';
  }

  if (keywords.includes('database') || keywords.includes('mysql') || keywords.includes('query')) {
    agents['db_manager'] = 'Database manager - MySQL operations';
  }

  if (keywords.includes('email') || keywords.includes('notify')) {
    agents['mailer'] = 'Email service - Notifications';
  }

  return agents;
}

/**
 * Build workflow steps using fabric-style patterns
 */
async function buildWorkflowSteps(
  jobDescription: string,
  agents: Record<string, string>,
  requestedPatterns?: string[]
): Promise<any[]> {
  const steps: any[] = [];
  const keywords = jobDescription.toLowerCase();

  // Pattern 1: Data Collection
  if (keywords.includes('scrape') || keywords.includes('fetch') || keywords.includes('collect')) {
    steps.push({
      type: 'fabric_pattern',
      pattern: 'extract_data',
      description: 'Extract data from source',
      agent: 'gentil',
      fabric_template: 'extract_wisdom'
    });
  }

  // Pattern 2: AI Processing
  if (keywords.includes('generate') || keywords.includes('analyze') || keywords.includes('ai')) {
    steps.push({
      type: 'fabric_pattern',
      pattern: 'ai_processing',
      description: 'Process data with AI',
      agent: 'grok',
      fabric_template: 'improve_writing'
    });
  }

  // Pattern 3: Database Operations
  if (keywords.includes('save') || keywords.includes('store') || keywords.includes('database')) {
    steps.push({
      type: 'api_call',
      description: 'Store results in database',
      agent: 'db_manager',
      endpoint: '/api/anunturi'
    });
  }

  // Pattern 4: Blockchain Recording
  if (keywords.includes('blockchain') || keywords.includes('audit') || keywords.includes('validator')) {
    steps.push({
      type: 'fabric_pattern',
      pattern: 'blockchain_record',
      description: 'Record on Sacred Nodes blockchain',
      agent: 'kael',
      fabric_template: 'create_smart_contract'
    });
  }

  // Pattern 5: Notification
  if (keywords.includes('notify') || keywords.includes('email') || keywords.includes('send')) {
    steps.push({
      type: 'api_call',
      description: 'Send notification to user',
      agent: 'mailer',
      endpoint: '/api/notifications'
    });
  }

  // If no steps detected, create generic workflow
  if (steps.length === 0) {
    steps.push({
      type: 'manual',
      description: `Execute: ${jobDescription}`,
      agent: Object.keys(agents)[0] || 'claude'
    });
  }

  return steps;
}

/**
 * Detect if workflow needs blockchain recording
 */
function detectBlockchainNeed(jobDescription: string): boolean {
  const blockchainKeywords = ['blockchain', 'audit', 'validator', 'smart contract', 'sacred nodes'];
  return blockchainKeywords.some(kw => jobDescription.toLowerCase().includes(kw));
}

/**
 * GET - List all available workflows
 */
export async function GET() {
  try {
    const workflowsDir = path.join(process.cwd(), '.claude', 'workflows');
    const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));

    const workflows = files.map(file => {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf-8');
      return JSON.parse(content);
    });

    return NextResponse.json({
      count: workflows.length,
      workflows: workflows.map(w => ({
        name: w.name,
        description: w.description,
        agents: Object.keys(w.agents || {}),
        steps: w.steps?.length || 0
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
