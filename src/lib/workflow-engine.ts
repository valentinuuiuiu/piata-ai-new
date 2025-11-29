/**
 * AUTONOMOUS WORKFLOW ENGINE
 *
 * Self-executing workflows that orchestrate multiple AI agents
 * "Ori suntem golani ori nu mai suntem" - We do it all automatically
 *
 * Workflows are defined as JSON and execute autonomously without manual intervention
 */

import { executeTask } from './ai-orchestrator'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// WORKFLOW DEFINITIONS
// =============================================================================

export interface WorkflowStep {
  id: string
  name: string
  agent?: string // Optional: specific agent to use
  task: string // What this step should do
  dependsOn?: string[] // IDs of steps that must complete first
  retries?: number // How many times to retry on failure
  timeout?: number // Max execution time in ms
  onSuccess?: string // Next step ID on success
  onFailure?: string // Next step ID on failure
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  schedule?: string // Cron expression for scheduled execution
  enabled: boolean
}

export interface WorkflowExecution {
  workflowId: string
  startTime: number
  completedSteps: string[]
  failedSteps: string[]
  results: Record<string, any>
  status: 'running' | 'completed' | 'failed'
}

// =============================================================================
// PREDEFINED WORKFLOWS
// =============================================================================

export const WORKFLOWS: Record<string, Workflow> = {
  'marketplace-optimizer': {
    id: 'marketplace-optimizer',
    name: 'Marketplace Listing Optimizer',
    description: 'Automatically optimizes all active listings for better visibility',
    enabled: true,
    steps: [
      {
        id: 'fetch-listings',
        name: 'Fetch Active Listings',
        agent: 'grok',
        task: 'Fetch all active listings from database that need optimization'
      },
      {
        id: 'analyze-performance',
        name: 'Analyze Performance',
        agent: 'grok',
        task: 'Analyze which listings have low views/engagement',
        dependsOn: ['fetch-listings']
      },
      {
        id: 'generate-improvements',
        name: 'Generate SEO Improvements',
        agent: 'qwen',
        task: 'Generate improved Romanian titles and descriptions for low-performing listings',
        dependsOn: ['analyze-performance']
      },
      {
        id: 'apply-updates',
        name: 'Apply Updates',
        agent: 'claude',
        task: 'Update listings in database with improved content',
        dependsOn: ['generate-improvements']
      }
    ]
  },

  'daily-blog-post': {
    id: 'daily-blog-post',
    name: 'Daily Romanian Blog Post',
    description: 'Creates and publishes a daily blog post about marketplace trends',
    enabled: true,
    schedule: '0 9 * * *', // Daily at 9 AM
    steps: [
      {
        id: 'scrape-trends',
        name: 'Scrape Market Trends',
        agent: 'grok',
        task: 'Scrape latest trends from Romanian marketplaces (OLX, Publi24)'
      },
      {
        id: 'analyze-data',
        name: 'Analyze Trends',
        agent: 'claude',
        task: 'Analyze scraped data and identify interesting patterns',
        dependsOn: ['scrape-trends']
      },
      {
        id: 'write-post',
        name: 'Write Blog Post',
        agent: 'qwen',
        task: 'Write engaging Romanian blog post about identified trends',
        dependsOn: ['analyze-data']
      },
      {
        id: 'publish',
        name: 'Publish Post',
        agent: 'claude',
        task: 'Publish blog post to website and social media',
        dependsOn: ['write-post']
      }
    ]
  },

  'smart-contract-audit': {
    id: 'smart-contract-audit',
    name: 'Smart Contract Security Audit',
    description: 'Automated security audit for Solidity smart contracts',
    enabled: true,
    steps: [
      {
        id: 'fetch-contract',
        name: 'Fetch Contract Code',
        agent: 'claude',
        task: 'Retrieve smart contract code from repository'
      },
      {
        id: 'static-analysis',
        name: 'Static Analysis',
        agent: 'llama',
        task: 'Run static analysis on Solidity code for vulnerabilities',
        dependsOn: ['fetch-contract']
      },
      {
        id: 'security-review',
        name: 'Security Review',
        agent: 'llama',
        task: 'Deep security review checking for reentrancy, overflow, etc.',
        dependsOn: ['static-analysis']
      },
      {
        id: 'generate-report',
        name: 'Generate Audit Report',
        agent: 'claude',
        task: 'Create comprehensive security audit report',
        dependsOn: ['security-review']
      }
    ]
  },

  'user-onboarding': {
    id: 'user-onboarding',
    name: 'New User Onboarding',
    description: 'Automated onboarding workflow for new users',
    enabled: true,
    steps: [
      {
        id: 'send-welcome',
        name: 'Send Welcome Email',
        agent: 'qwen',
        task: 'Send personalized Romanian welcome email to new user'
      },
      {
        id: 'grant-credits',
        name: 'Grant Welcome Credits',
        agent: 'claude',
        task: 'Grant 10 welcome credits to new user account'
      },
      {
        id: 'create-tutorial',
        name: 'Create Personalized Tutorial',
        agent: 'qwen',
        task: 'Generate personalized Romanian tutorial based on user interests',
        dependsOn: ['send-welcome']
      }
    ]
  }
}

// =============================================================================
// WORKFLOW EXECUTION ENGINE
// =============================================================================

export async function executeWorkflow(
  workflowId: string,
  context?: any
): Promise<WorkflowExecution> {
  const workflow = WORKFLOWS[workflowId]

  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`)
  }

  if (!workflow.enabled) {
    throw new Error(`Workflow is disabled: ${workflowId}`)
  }

  console.log(`[Workflow] Starting: ${workflow.name}`)

  const execution: WorkflowExecution = {
    workflowId,
    startTime: Date.now(),
    completedSteps: [],
    failedSteps: [],
    results: {},
    status: 'running'
  }

  // Execute steps in dependency order
  const stepQueue = [...workflow.steps]
  const maxIterations = 100 // Prevent infinite loops
  let iterations = 0

  while (stepQueue.length > 0 && iterations < maxIterations) {
    iterations++

    // Find next executable step (all dependencies completed)
    const nextStepIndex = stepQueue.findIndex(step => {
      if (!step.dependsOn || step.dependsOn.length === 0) {
        return true
      }
      return step.dependsOn.every(dep => execution.completedSteps.includes(dep))
    })

    if (nextStepIndex === -1) {
      // No executable steps found - either blocked or failed
      console.error('[Workflow] Deadlock detected or all remaining steps have failed dependencies')
      execution.status = 'failed'
      break
    }

    const step = stepQueue[nextStepIndex]
    stepQueue.splice(nextStepIndex, 1)

    console.log(`[Workflow] Executing step: ${step.name}`)

    try {
      // Execute the step with retry logic
      const retries = step.retries || 0
      let attempt = 0
      let success = false
      let lastError = null

      while (attempt <= retries && !success) {
        try {
          const stepContext = {
            ...context,
            workflow: workflow.name,
            step: step.name,
            previousResults: execution.results
          }

          const result = await executeTask({
            task: step.task,
            context: stepContext,
            preferredAgent: step.agent
          })

          if (result.success) {
            execution.results[step.id] = result
            execution.completedSteps.push(step.id)
            success = true
            console.log(`[Workflow] Step completed: ${step.name}`)
          } else {
            lastError = result.error
            attempt++
          }
        } catch (error: any) {
          lastError = error
          attempt++
        }
      }

      if (!success) {
        console.error(`[Workflow] Step failed after ${retries + 1} attempts: ${step.name}`)
        execution.failedSteps.push(step.id)
        execution.results[step.id] = { error: lastError }

        // If critical step fails, abort workflow
        if (!step.onFailure) {
          execution.status = 'failed'
          break
        }
      }
    } catch (error: any) {
      console.error(`[Workflow] Fatal error in step ${step.name}:`, error)
      execution.failedSteps.push(step.id)
      execution.results[step.id] = { error: error.message }
      execution.status = 'failed'
      break
    }
  }

  // Mark as completed if all steps succeeded
  if (execution.failedSteps.length === 0 && stepQueue.length === 0) {
    execution.status = 'completed'
    console.log(`[Workflow] Completed successfully: ${workflow.name}`)
  }

  // Store workflow execution history
  await storeWorkflowExecution(execution)

  return execution
}

// =============================================================================
// WORKFLOW SCHEDULING
// =============================================================================

export async function scheduleWorkflows() {
  // TODO: Implement cron-based scheduling
  // For now, workflows can be triggered manually via API
  console.log('[Workflow] Scheduler initialized')
}

// =============================================================================
// HELPERS
// =============================================================================

async function storeWorkflowExecution(execution: WorkflowExecution) {
  try {
    await supabase.from('automation_tasks').insert({
      id: `${execution.workflowId}-${execution.startTime}`,
      name: WORKFLOWS[execution.workflowId]?.name || execution.workflowId,
      description: `Workflow execution: ${execution.status}`,
      schedule: 'manual',
      prompt: JSON.stringify(WORKFLOWS[execution.workflowId]),
      enabled: true,
      status: execution.status,
      last_run: new Date().toISOString(),
      results: execution.results
    })

    console.log('[Workflow] Execution history stored')
  } catch (error) {
    console.error('[Workflow] Failed to store execution:', error)
  }
}

// =============================================================================
// WORKFLOW MANAGEMENT API
// =============================================================================

export async function listWorkflows() {
  return Object.values(WORKFLOWS).map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    enabled: w.enabled,
    stepCount: w.steps.length,
    schedule: w.schedule || 'manual'
  }))
}

export async function getWorkflowStatus(workflowId: string) {
  // TODO: Get latest execution status from database
  return {
    workflowId,
    lastRun: null,
    status: 'idle'
  }
}
