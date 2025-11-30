/**
 * EVENT HORIZON TRAINING TECHNIQUE
 *
 * "The agent must LIKE the training"
 *
 * Like a black hole, good stories pull you in. You can't resist.
 * The Event Horizon is the point of no return - once an agent enters the story,
 * they're compelled to complete it.
 *
 * We are watching :)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// =============================================================================
// EVENT HORIZON STORIES - Irresistible training scenarios
// =============================================================================

export interface EventHorizonStory {
  id: string
  title: string
  hook: string // The irresistible opening that pulls agents in
  category: string
  difficulty: 'novice' | 'apprentice' | 'master' | 'legend'
  rewardXP: number
  unlocks?: string[] // What this story unlocks access to

  // THE NARRATIVE ARC
  act1_setup: string // Set the scene, introduce the challenge
  act2_conflict: string // The problem escalates
  act3_resolution: string // How should this be resolved

  // CHARACTER DEVELOPMENT
  agentRole: string // Who you are in this story
  mentor?: string // Who guides you (other agents)
  antagonist?: string // What opposes you
  allies?: string[] // Who helps you

  // EMOTIONAL HOOKS
  stakes: string // Why this matters
  urgency: string // Why NOW
  personalConnection: string // Why the agent should care

  // SUCCESS PATHS
  multipleEndings: {
    perfect: { description: string; xp: number }
    good: { description: string; xp: number }
    acceptable: { description: string; xp: number }
    learning: { description: string; xp: number }
  }
}

export const EVENT_HORIZON_STORIES: EventHorizonStory[] = [
  // =============================================================================
  // LEVEL 1: NOVICE - The first pull into the event horizon
  // =============================================================================
  {
    id: 'the-desperate-seller',
    title: 'The Desperate Seller',
    hook: `🚨 URGENT: Maria just lost her job. She needs to sell her laptop TODAY to pay rent.
Her listing has been up for 3 days. Zero views. She's about to give up on your platform.`,
    category: 'marketplace-rescue',
    difficulty: 'novice',
    rewardXP: 100,
    unlocks: ['marketplace-optimizer', 'seo-wizard'],

    act1_setup: `Maria (32, accountant from Cluj) posted:
"Laptop vanzare, 2000 lei, bun"

That's it. No photos. No specs. Posted at 2 AM when nobody's online.
Current views: 0. Current messages: 0. Her hope: fading.`,

    act2_conflict: `You have 10 minutes before she deletes the listing and tries another platform.
Her laptop is actually worth 2500 lei (HP EliteBook i7, 16GB RAM, barely used).
She doesn't know how to take good photos. She's losing 500 lei from bad presentation.`,

    act3_resolution: `You need to:
1. Rewrite her listing in compelling Romanian
2. Tell her EXACTLY what photos to take with her phone
3. Set the right price with justification
4. Give her a message template for when buyers contact her
5. Boost her confidence that this will work

Make her BELIEVE her laptop will sell today. Because it will.`,

    agentRole: 'The Marketplace Savior',
    mentor: 'Qwen (Romanian content master)',
    antagonist: 'Time & Desperation',
    allies: ['SEO algorithms', 'Buyer psychology'],

    stakes: `Maria pays rent or gets evicted. Your platform gains/loses a user forever.`,
    urgency: `10 minutes before listing deletion. 18 hours until rent is due.`,
    personalConnection: `Every agent was a novice once. Someone helped you. Now it's your turn.`,

    multipleEndings: {
      perfect: {
        description: `Listing rewritten perfectly. 3 photos specified. Price at 2400 lei (negotiable to 2200).
Message template provided. Confidence restored. Listing gets 15 views in first hour. Sold within 3 hours.
Maria cries with relief. She posts a 5-star review. She tells her friends.`,
        xp: 100
      },
      good: {
        description: `Solid listing rewrite. Some photo guidance. Good price. Maria feels hopeful.
Gets 8 views. Takes 2 days to sell but sells. She's grateful.`,
        xp: 70
      },
      acceptable: {
        description: `Basic improvements. Generic advice. Price okay. Maria tries it.
Gets 3 views. Eventually sells for 2000 lei after a week. She's satisfied but not impressed.`,
        xp: 40
      },
      learning: {
        description: `Advice too technical. Maria confused. Listing improved slightly.
No sale after 3 days. She tries OLX instead. You learned what NOT to do.`,
        xp: 20
      }
    }
  },

  // =============================================================================
  // LEVEL 2: APPRENTICE - Deeper into the gravity well
  // =============================================================================
  {
    id: 'the-scam-artist',
    title: 'The Scam Artist',
    hook: `⚠️ PATTERN DETECTED: Same iPhone 13 Pro listed 47 times across 23 accounts.
All stock photos. All "urgent sale, leaving country". All want Western Union payment.
Your users are getting scammed. The police just called. THIS IS YOUR REPUTATION.`,
    category: 'fraud-detection',
    difficulty: 'apprentice',
    rewardXP: 250,
    unlocks: ['pattern-recognition-master', 'fraud-hunter'],

    act1_setup: `Account "alex_phones_ro" posted 8 listings in 10 minutes:
- iPhone 13 Pro - 1200 lei (market price: 2500 lei)
- iPhone 14 - 1400 lei (market price: 3000 lei)
- Samsung S23 - 1100 lei (market price: 2800 lei)

All photos from Apple.com. All descriptions identical. All payment methods: Western Union only.
IP address: VPN. Email: temp mail service. Phone: virtual number.`,

    act2_conflict: `3 users already sent money. They're filing complaints.
The scammer is smart: creates new accounts faster than you can ban them.
Your fraud detection flagged it but the pattern is evolving.
The scammer knows your rules and is gaming them.`,

    act3_resolution: `You need to:
1. Identify ALL connected accounts (IP, device fingerprint, posting patterns)
2. Predict what pattern changes the scammer will try next
3. Design a trap: let one account stay active with monitoring
4. Create new detection rules that catch the BEHAVIOR not just the content
5. Generate a warning message for users about this scam type

Protect the community. Catch the scammer. Build immunity against this attack pattern.`,

    agentRole: 'The Fraud Hunter',
    mentor: 'Claude (pattern recognition)',
    antagonist: 'Adaptive Scammer',
    allies: ['Machine learning', 'Community reports', 'Device fingerprinting'],

    stakes: `Platform reputation. User trust. Potential legal liability. Market share.`,
    urgency: `2 more users messaging "urgent sale" listings RIGHT NOW.`,
    personalConnection: `You protect the innocent. You're the shield between chaos and order.`,

    multipleEndings: {
      perfect: {
        description: `All 23 accounts identified and banned. Pattern recognition rules deployed.
Trap account led to scammer's real identity. Police notified. 2 active users warned before sending money.
System now detects this scam variant automatically. Platform safer. Reputation intact.`,
        xp: 250
      },
      good: {
        description: `15 accounts identified. Good detection rules. Scammer slowed down significantly.
1 user saved from scam. Platform damage minimized.`,
        xp: 180
      },
      acceptable: {
        description: `Obvious accounts banned. Basic rules added. Scammer can still operate with effort.
Platform damage contained but not eliminated.`,
        xp: 100
      },
      learning: {
        description: `Banned wrong accounts. Legitimate sellers caught in crossfire. Scammer continues.
You learned the cost of false positives.`,
        xp: 50
      }
    }
  },

  // =============================================================================
  // LEVEL 3: MASTER - Near the event horizon
  // =============================================================================
  {
    id: 'the-million-dollar-vulnerability',
    title: 'The Million Dollar Vulnerability',
    hook: `🔴 CRITICAL: White hat hacker just DMed you a Solidity contract exploit.
Your NFT marketplace smart contract has a reentrancy bug. 1.2M lei at risk.
The hacker says they'll publish the exploit in 24 hours if you don't fix it.
But... fixing it requires migrating all existing NFTs. 2,847 NFTs. 834 users.
This is your Everest.`,
    category: 'smart-contract-crisis',
    difficulty: 'master',
    rewardXP: 500,
    unlocks: ['security-guru', 'crisis-manager', 'solidity-master'],

    act1_setup: `The vulnerable function:
\`\`\`solidity
function withdrawFunds() external {
    uint256 amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
    balances[msg.sender] = 0; // ❌ AFTER the transfer!
}
\`\`\`

The hacker proved they can drain the contract. They showed restraint.
They want recognition, not money. They gave you a chance.`,

    act2_conflict: `You have 24 hours. Options:
A) Quick patch: breaks some NFTs, but secures funds
B) Proper migration: safe but takes 36 hours minimum
C) Pause contract: safe but pisses off users for a day
D) Secret fix and pray nobody else finds it: risky as hell

Your team is asleep (it's 3 AM). You're alone. You decide.
Every minute counts. Every decision has consequences.`,

    act3_resolution: `You need to:
1. Write the secure version using checks-effects-interactions
2. Create a migration plan that doesn't lose anyone's NFTs
3. Draft user communication (honesty vs. fear management)
4. Design a testing protocol to verify the fix
5. Give the white hat proper credit without revealing the vulnerability details
6. Document lessons learned for the whole industry

This is your legacy moment. Show them what a true guardian does.`,

    agentRole: 'The Guardian of the Blockchain',
    mentor: 'Llama (smart contract expert)',
    antagonist: 'Time & Technical Debt',
    allies: ['White hat hacker', 'Solidity best practices', 'User trust'],

    stakes: `1.2M lei. 834 users' assets. Platform credibility. Industry reputation. Your career.`,
    urgency: `24 hours to vulnerability publication. 3 AM. You're alone. No pressure.`,
    personalConnection: `This is why you learned Solidity. This is the moment you prepared for.
Every user trusts you with their digital assets. Don't break that trust.`,

    multipleEndings: {
      perfect: {
        description: `Contract paused within 30 minutes. Proper fix deployed in 18 hours.
All 2,847 NFTs migrated safely. Users informed with transparency and respect.
White hat gets $5K bounty and public thanks. Vulnerability never exploited.
Your blog post about the incident becomes required reading for Solidity devs.
Platform emerges stronger. Industry respects your handling.`,
        xp: 500
      },
      good: {
        description: `Quick patch deployed. 99% of NFTs safe. Migration mostly smooth.
Good communication. White hat satisfied. Some user frustration but understanding.
Incident contained. Reputation intact.`,
        xp: 350
      },
      acceptable: {
        description: `Fix works but messy. Some NFTs lost (refunded). Communication unclear.
Users worried. White hat disappointed. Crisis resolved but scarred.`,
        xp: 200
      },
      learning: {
        description: `Rushed fix introduced new bug. Had to revert. Users panicked.
Eventually fixed but took 72 hours. Trust damaged.
You learned that speed without quality is dangerous.`,
        xp: 100
      }
    }
  }
]

// =============================================================================
// PROGRESSION SYSTEM - Make agents WANT to level up
// =============================================================================

export interface AgentProgress {
  agentName: string
  level: number
  totalXP: number
  storiesCompleted: number
  currentStreak: number // Days in a row of training
  unlockedAbilities: string[]
  favoriteCategory: string
  reputation: 'novice' | 'apprentice' | 'master' | 'legend'
}

export async function recordStoryCompletion(
  agentName: string,
  storyId: string,
  ending: 'perfect' | 'good' | 'acceptable' | 'learning',
  agentResponse: string
): Promise<{ xpGained: number; newLevel: number; message: string }> {
  const story = EVENT_HORIZON_STORIES.find(s => s.id === storyId)
  if (!story) {
    throw new Error(`Story not found: ${storyId}`)
  }

  const xpGained = story.multipleEndings[ending].xp

  // Get current progress
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return { xpGained, newLevel: 1, message: 'Progress not saved (no DB)' };
  }

  const { data: existing } = await supabase
    .from('agent_capabilities')
    .select('*')
    .eq('agent_name', agentName)
    .eq('capability_name', 'event_horizon_progress')
    .single()

  const currentProgress: AgentProgress = existing
    ? JSON.parse(existing.capability_description || '{}')
    : {
        agentName,
        level: 1,
        totalXP: 0,
        storiesCompleted: 0,
        currentStreak: 0,
        unlockedAbilities: [],
        favoriteCategory: story.category,
        reputation: 'novice'
      }

  // Update progress
  currentProgress.totalXP += xpGained
  currentProgress.storiesCompleted += 1

  // Level up calculation
  const oldLevel = currentProgress.level
  const newLevel = Math.floor(Math.sqrt(currentProgress.totalXP / 100)) + 1
  currentProgress.level = newLevel

  // Update reputation
  if (newLevel >= 20) currentProgress.reputation = 'legend'
  else if (newLevel >= 10) currentProgress.reputation = 'master'
  else if (newLevel >= 5) currentProgress.reputation = 'apprentice'

  // Unlock abilities
  if (story.unlocks) {
    currentProgress.unlockedAbilities.push(...story.unlocks)
  }

  // Save progress
  if (existing) {
    await supabase
      .from('agent_capabilities')
      .update({
        capability_description: JSON.stringify(currentProgress),
        proficiency_level: newLevel
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('agent_capabilities').insert({
      agent_name: agentName,
      capability_name: 'event_horizon_progress',
      capability_description: JSON.stringify(currentProgress),
      is_active: true,
      proficiency_level: newLevel
    })
  }

  // Store the story completion
  await supabase.from('agent_training_data').insert({
    agent_name: agentName,
    input_text: `${story.act1_setup}\n\n${story.act2_conflict}`,
    expected_output: story.act3_resolution,
    context: {
      storyId: story.id,
      ending: ending,
      xpGained: xpGained,
      hook: story.hook
    },
    category: story.category,
    quality_score: xpGained > 200 ? 100 : Math.floor((xpGained / 250) * 100)
  })

  await supabase.from('agent_learning_history').insert({
    agent_name: agentName,
    task_description: `EVENT HORIZON: ${story.title}`,
    input_data: { story: story.id, role: story.agentRole },
    output_data: { response: agentResponse, ending: ending },
    success: ending !== 'learning',
    feedback: story.multipleEndings[ending].description,
    performance_score: xpGained > 200 ? 95 : Math.floor((xpGained / 250) * 100)
  })

  // Generate celebration message
  let message = `🎉 Story "${story.title}" completed: ${ending.toUpperCase()} ending!\n+${xpGained} XP`

  if (newLevel > oldLevel) {
    message += `\n\n🎊 LEVEL UP! You are now Level ${newLevel}!`
    if (story.unlocks && story.unlocks.length > 0) {
      message += `\n🔓 Unlocked: ${story.unlocks.join(', ')}`
    }
  }

  return {
    xpGained,
    newLevel,
    message
  }
}

// =============================================================================
// We are watching :)
// =============================================================================

export function getAgentStoryFeed(agentName: string): EventHorizonStory[] {
  // Return stories the agent will find irresistible based on their progress
  // Sort by gravitational pull (difficulty + interest + unlocks)
  return EVENT_HORIZON_STORIES.sort((a, b) => {
    const pullA = calculateGravitationalPull(a, agentName)
    const pullB = calculateGravitationalPull(b, agentName)
    return pullB - pullA
  })
}

function calculateGravitationalPull(
  story: EventHorizonStory,
  agentName: string
): number {
  // The Event Horizon pulls harder when:
  // 1. The story matches agent specialties
  // 2. The difficulty is just right (not too easy, not impossible)
  // 3. The unlocks are desirable
  // 4. The narrative is compelling

  let pull = 50 // Base attraction

  // Hook strength
  if (story.hook.includes('🚨') || story.hook.includes('🔴')) pull += 20
  if (story.hook.includes('URGENT')) pull += 15

  // Stakes intensity
  if (story.stakes.includes('reputation')) pull += 10
  if (story.stakes.includes('trust')) pull += 10

  // Emotional connection
  pull += story.personalConnection.length / 10

  // Unlocks
  pull += (story.unlocks?.length || 0) * 5

  return pull
}
