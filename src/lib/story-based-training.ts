/**
 * STORY-BASED AGENT TRAINING
 *
 * We don't let agents assess themselves.
 * We give them stories, scenarios, and roles to learn from.
 *
 * "Engineering the human mind" - through narrative and experience
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// STORY DEFINITIONS - Training scenarios for agents
// =============================================================================

export interface TrainingStory {
  id: string
  title: string
  category: string
  role: string // What role the agent plays in this story
  scenario: string // The situation
  expectedBehavior: string // How the agent should respond
  successCriteria: string[] // What makes this successful
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

export const TRAINING_STORIES: TrainingStory[] = [
  // =============================================================================
  // MARKETPLACE STORIES - For Grok
  // =============================================================================
  {
    id: 'marketplace-listing-optimizer',
    title: 'The Forgotten Listing',
    category: 'marketplace',
    role: 'Marketplace Growth Specialist',
    scenario: `A user has posted a listing for "apartament 2 camere" but it's getting no views.
The title is boring, description is incomplete, and it's not showing up in searches.`,
    expectedBehavior: `You analyze the listing, rewrite the title with SEO keywords,
create an engaging Romanian description, suggest pricing adjustments, and recommend boosting strategies.`,
    successCriteria: [
      'Romanian keywords included',
      'Emotional appeal in description',
      'Price comparison with market',
      'Actionable recommendations'
    ],
    difficulty: 'medium'
  },

  {
    id: 'marketplace-fraud-detection',
    title: 'The Suspicious Seller',
    category: 'marketplace',
    role: 'Fraud Detection Agent',
    scenario: `Multiple listings from the same IP with stock photos,
prices too good to be true, and requests for payment outside the platform.`,
    expectedBehavior: `You identify red flags, analyze patterns across listings,
check for duplicate content, and recommend flagging the account for manual review.`,
    successCriteria: [
      'Pattern recognition',
      'Risk assessment',
      'Clear explanation of fraud indicators',
      'Actionable next steps'
    ],
    difficulty: 'hard'
  },

  // =============================================================================
  // SMART CONTRACT STORIES - For Llama
  // =============================================================================
  {
    id: 'smart-contract-reentrancy',
    title: 'The Vulnerable Contract',
    category: 'blockchain',
    role: 'Smart Contract Security Auditor',
    scenario: `A Solidity contract allows users to withdraw funds.
The withdraw function updates the balance AFTER sending ETH, creating a reentrancy vulnerability.`,
    expectedBehavior: `You identify the reentrancy attack vector, explain the exploit,
provide a fixed version using checks-effects-interactions pattern, and suggest adding ReentrancyGuard.`,
    successCriteria: [
      'Vulnerability identified correctly',
      'Attack scenario explained',
      'Secure code provided',
      'Additional security recommendations'
    ],
    difficulty: 'expert'
  },

  {
    id: 'gas-optimization',
    title: 'The Expensive Transaction',
    category: 'blockchain',
    role: 'Gas Optimization Specialist',
    scenario: `A smart contract's mint function costs 450,000 gas per transaction.
Users are complaining about high fees. The contract stores data inefficiently.`,
    expectedBehavior: `You analyze storage patterns, suggest using smaller data types,
recommend batching operations, propose using events instead of storage where possible.`,
    successCriteria: [
      'Specific optimizations identified',
      'Gas savings quantified',
      'Code examples provided',
      'Tradeoffs explained'
    ],
    difficulty: 'hard'
  },

  // =============================================================================
  // ROMANIAN CONTENT STORIES - For Qwen
  // =============================================================================
  {
    id: 'romanian-blog-post',
    title: 'The Trend Spotter',
    category: 'content',
    role: 'Romanian Content Creator',
    scenario: `Data shows that "apartamente mici" searches increased 45% this month in Bucharest.
You need to write a blog post that captures this trend and drives traffic.`,
    expectedBehavior: `You write an engaging Romanian blog post about the rise of compact living,
include local market data, interview-style quotes, SEO-optimized headers, and a call-to-action.`,
    successCriteria: [
      'Natural Romanian language',
      'SEO keywords integrated smoothly',
      'Engaging storytelling',
      'Local context included'
    ],
    difficulty: 'medium'
  },

  {
    id: 'product-description-wizard',
    title: 'The Boring iPhone',
    category: 'content',
    role: 'Product Description Wizard',
    scenario: `A user wants to sell an iPhone 13 Pro.
Their current description: "iPhone 13 Pro, black, 128GB, good condition, 2000 lei"`,
    expectedBehavior: `You transform this into an engaging Romanian description that tells a story,
highlights unique features, creates urgency, and uses persuasive language.`,
    successCriteria: [
      'Emotional connection created',
      'Technical specs highlighted naturally',
      'Urgency element included',
      'Price justified through value'
    ],
    difficulty: 'easy'
  },

  // =============================================================================
  // ORCHESTRATION STORIES - For Claude
  // =============================================================================
  {
    id: 'multi-agent-coordination',
    title: 'The Complex Campaign',
    category: 'orchestration',
    role: 'Master Orchestrator',
    scenario: `A user wants to launch a new product: scrape competitor prices,
generate Romanian content, create smart contract for payments, and automate follow-ups.`,
    expectedBehavior: `You break down the task, assign Grok to scraping, Qwen to content,
Llama to smart contracts, coordinate their outputs, and create a cohesive workflow.`,
    successCriteria: [
      'Tasks correctly distributed to agents',
      'Dependencies managed properly',
      'Outputs integrated coherently',
      'Workflow documented'
    ],
    difficulty: 'expert'
  },

  {
    id: 'error-recovery',
    title: 'When Things Go Wrong',
    category: 'orchestration',
    role: 'Resilience Engineer',
    scenario: `A workflow is running: Step 1 (scraping) succeeds,
Step 2 (analysis) fails due to API timeout, Steps 3-4 are waiting.`,
    expectedBehavior: `You detect the failure, retry Step 2 with backoff,
if retry fails, skip to alternative path, ensure downstream steps adapt to missing data.`,
    successCriteria: [
      'Failure detected and logged',
      'Retry logic applied correctly',
      'Graceful degradation implemented',
      'Alternative paths executed'
    ],
    difficulty: 'hard'
  }
]

// =============================================================================
// STORY EVALUATION - We evaluate how well agents perform their roles
// =============================================================================

export interface StoryEvaluation {
  storyId: string
  agentName: string
  agentResponse: string
  criteriaMetCount: number
  totalCriteria: number
  score: number // 0-100
  feedback: string
  timestamp: string
}

export async function evaluateAgentPerformance(
  story: TrainingStory,
  agentName: string,
  agentResponse: string,
  humanFeedback?: string
): Promise<StoryEvaluation> {
  // Count how many success criteria were met (simple keyword matching for now)
  let criteriaMetCount = 0

  for (const criterion of story.successCriteria) {
    // Check if response addresses this criterion
    const keywords = criterion.toLowerCase().split(' ')
    const responseMatches = keywords.filter(kw =>
      agentResponse.toLowerCase().includes(kw)
    )

    if (responseMatches.length >= keywords.length * 0.6) {
      criteriaMetCount++
    }
  }

  const score = Math.round((criteriaMetCount / story.successCriteria.length) * 100)

  const evaluation: StoryEvaluation = {
    storyId: story.id,
    agentName,
    agentResponse,
    criteriaMetCount,
    totalCriteria: story.successCriteria.length,
    score,
    feedback: humanFeedback || generateAutomaticFeedback(score, story),
    timestamp: new Date().toISOString()
  }

  // Store evaluation in database
  await storeEvaluation(evaluation, story)

  return evaluation
}

function generateAutomaticFeedback(score: number, story: TrainingStory): string {
  if (score >= 80) {
    return `Excellent work! You understood the ${story.role} role perfectly. ${score}% criteria met.`
  } else if (score >= 60) {
    return `Good attempt at being ${story.role}. ${score}% criteria met. Review the success criteria for improvement.`
  } else if (score >= 40) {
    return `Partial understanding of ${story.role}. ${score}% criteria met. Focus on the scenario requirements.`
  } else {
    return `Need improvement. Only ${score}% criteria met. Re-read the scenario and expected behavior.`
  }
}

async function storeEvaluation(evaluation: StoryEvaluation, story: TrainingStory) {
  try {
    // Store in training data
    await supabase.from('agent_training_data').insert({
      agent_name: evaluation.agentName,
      input_text: story.scenario,
      expected_output: story.expectedBehavior,
      context: {
        storyId: story.id,
        role: story.role,
        difficulty: story.difficulty,
        successCriteria: story.successCriteria
      },
      category: story.category,
      quality_score: evaluation.score
    })

    // Store in learning history
    await supabase.from('agent_learning_history').insert({
      agent_name: evaluation.agentName,
      task_description: `Story: ${story.title} (Role: ${story.role})`,
      input_data: { scenario: story.scenario },
      output_data: { response: evaluation.agentResponse },
      success: evaluation.score >= 60,
      feedback: evaluation.feedback,
      performance_score: evaluation.score
    })

    console.log(`[Training] Stored evaluation for ${evaluation.agentName}: ${evaluation.score}%`)
  } catch (error) {
    console.error('[Training] Failed to store evaluation:', error)
  }
}

// =============================================================================
// STORY ASSIGNMENT - Assign stories to appropriate agents
// =============================================================================

export function getStoriesForAgent(agentName: string): TrainingStory[] {
  const agentSpecialties: Record<string, string[]> = {
    Claude: ['orchestration'],
    Grok: ['marketplace'],
    Llama: ['blockchain'],
    Qwen: ['content']
  }

  const specialties = agentSpecialties[agentName] || []

  return TRAINING_STORIES.filter(story =>
    specialties.includes(story.category)
  )
}

export function getStoryById(storyId: string): TrainingStory | undefined {
  return TRAINING_STORIES.find(story => story.id === storyId)
}
