/**
 * Multi-Channel Promotional Workflows
 * 
 * Integrated workflows that coordinate Email, Social Media, SEO, and Referral systems.
 */

import { Workflow } from './workflow-types';

export const MULTI_CHANNEL_WORKFLOWS: Workflow[] = [
  {
    id: 'romanian-marketplace-domination',
    name: 'Romanian Marketplace Domination',
    description: 'Coordinated multi-channel campaign to migrate users from OLX and eMAG',
    category: 'growth',
    enabled: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['competitor-migration', 'olx', 'emag', 'multi-channel'],
    agents: {
      'competitor_analyst': 'Grok-4.1-fast - Market intelligence',
      'content_creator': 'Qwen Coder - Multi-channel copy',
      'seo_specialist': 'Claude Code - SEO optimization',
      'growth_hacker': 'KAEL-3025 - Referral & viral loops'
    },
    steps: [
      {
        id: 'competitor-analysis',
        name: 'Analyze Competitor Gaps',
        type: 'agent_task',
        description: 'Identify pricing and feature gaps in OLX and eMAG for top categories',
        agent: 'competitor_analyst',
        requires_llm: true,
        timeout: 45000
      },
      {
        id: 'generate-migration-content',
        name: 'Generate Migration Content',
        type: 'agent_task',
        description: 'Create persuasive email, social, and ad copy focused on competitor migration',
        agent: 'content_creator',
        requires_llm: true,
        depends_on: ['competitor-analysis'],
        timeout: 60000
      },
      {
        id: 'seo-competitor-targeting',
        name: 'SEO Competitor Targeting',
        type: 'agent_task',
        description: 'Optimize landing pages for competitor-comparison keywords',
        agent: 'seo_specialist',
        requires_llm: true,
        depends_on: ['competitor-analysis'],
        timeout: 45000
      },
      {
        id: 'launch-migration-referral',
        name: 'Launch Migration Referral',
        type: 'api_call',
        description: 'Activate special referral bonuses for users who invite friends from OLX/eMAG',
        agent: 'growth_hacker',
        depends_on: ['generate-migration-content'],
        timeout: 30000
      },
      {
        id: 'distribute-multi-channel',
        name: 'Multi-Channel Distribution',
        type: 'api_call',
        description: 'Simultaneously launch email sequence and social media posts',
        agent: 'content_creator',
        depends_on: ['launch-migration-referral'],
        timeout: 60000
      }
    ]
  },

  {
    id: 'viral-growth-accelerator',
    name: 'Viral Growth Accelerator',
    description: 'Amplifies the referral system across all marketing channels for exponential growth',
    category: 'growth',
    enabled: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['viral', 'referral', 'social-proof', 'automation'],
    agents: {
      'growth_hacker': 'KAEL-3025 - Viral loop design',
      'social_manager': 'Grok-4.1-fast - Social amplification',
      'email_specialist': 'Qwen Coder - Personalized outreach'
    },
    steps: [
      {
        id: 'identify-power-users',
        name: 'Identify Power Users',
        type: 'api_call',
        description: 'Identify users with high engagement and potential for referrals',
        agent: 'growth_hacker',
        timeout: 30000
      },
      {
        id: 'create-viral-templates',
        name: 'Create Viral Templates',
        type: 'agent_task',
        description: 'Generate high-conversion sharing templates for WhatsApp, Facebook, and Instagram',
        agent: 'social_manager',
        requires_llm: true,
        depends_on: ['identify-power-users'],
        timeout: 45000
      },
      {
        id: 'personalized-referral-emails',
        name: 'Personalized Referral Emails',
        type: 'agent_task',
        description: 'Send personalized referral invitations with dynamic reward calculations',
        agent: 'email_specialist',
        requires_llm: true,
        depends_on: ['create-viral-templates'],
        timeout: 60000
      },
      {
        id: 'social-proof-campaign',
        name: 'Social Proof Campaign',
        type: 'api_call',
        description: 'Automate social posts showcasing successful referrers and their rewards',
        agent: 'social_manager',
        depends_on: ['personalized-referral-emails'],
        timeout: 30000
      }
    ]
  },

  {
    id: 'mobile-first-romanian-campaign',
    name: 'Mobile-First Romanian Campaign',
    description: 'Optimized marketing workflow for the 78% Romanian mobile user base',
    category: 'optimization',
    enabled: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['mobile-first', 'romania', 'tiktok', 'instagram'],
    agents: {
      'mobile_optimizer': 'Claude Code - Technical mobile SEO',
      'short_form_creator': 'Grok-4.1-fast - TikTok/Reels content',
      'push_specialist': 'Qwen Coder - SMS/Push style messaging'
    },
    steps: [
      {
        id: 'mobile-seo-audit',
        name: 'Mobile SEO Audit',
        type: 'agent_task',
        description: 'Audit and optimize all landing pages for mobile speed and UX',
        agent: 'mobile_optimizer',
        requires_llm: true,
        timeout: 60000
      },
      {
        id: 'generate-short-form-content',
        name: 'Generate Short-Form Content',
        type: 'agent_task',
        description: 'Create scripts and visual briefs for TikTok and Instagram Reels',
        agent: 'short_form_creator',
        requires_llm: true,
        depends_on: ['mobile-seo-audit'],
        timeout: 45000
      },
      {
        id: 'mobile-messaging-sequence',
        name: 'Mobile Messaging Sequence',
        type: 'agent_task',
        description: 'Create short, punchy email and notification sequences for mobile users',
        agent: 'push_specialist',
        requires_llm: true,
        depends_on: ['generate-short-form-content'],
        timeout: 45000
      },
      {
        id: 'deploy-mobile-ads',
        name: 'Deploy Mobile Ads',
        type: 'api_call',
        description: 'Launch mobile-only ad campaigns on Facebook and TikTok',
        agent: 'short_form_creator',
        depends_on: ['mobile-messaging-sequence'],
        timeout: 30000
      }
    ]
  },

  {
    id: 'cultural-localization-campaign',
    name: 'Cultural Localization Campaign',
    description: 'Integrates Romanian holidays, local events, and linguistic nuances into marketing',
    category: 'localization',
    enabled: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['localization', 'romanian-culture', 'events', 'trust'],
    agents: {
      'cultural_expert': 'Grok-4.1-fast - Romanian cultural insights',
      'copywriter': 'Qwen Coder - Authentic Romanian copy',
      'event_scheduler': 'Claude Code - Local event integration'
    },
    steps: [
      {
        id: 'identify-local-events',
        name: 'Identify Local Events',
        type: 'agent_task',
        description: 'Identify upcoming Romanian holidays, festivals, and local events',
        agent: 'cultural_expert',
        requires_llm: true,
        timeout: 30000
      },
      {
        id: 'generate-localized-content',
        name: 'Generate Localized Content',
        type: 'agent_task',
        description: 'Create content using local idioms, cultural references, and event themes',
        agent: 'copywriter',
        requires_llm: true,
        depends_on: ['identify-local-events'],
        timeout: 60000
      },
      {
        id: 'schedule-event-campaigns',
        name: 'Schedule Event Campaigns',
        type: 'api_call',
        description: 'Schedule multi-channel campaigns to coincide with identified local events',
        agent: 'event_scheduler',
        depends_on: ['generate-localized-content'],
        timeout: 30000
      },
      {
        id: 'trust-building-outreach',
        name: 'Trust-Building Outreach',
        type: 'agent_task',
        description: 'Create community-focused content that builds trust in the Romanian market',
        agent: 'cultural_expert',
        requires_llm: true,
        depends_on: ['schedule-event-campaigns'],
        timeout: 45000
      }
    ]
  },

  {
    id: 'performance-optimization-engine',
    name: 'Performance Optimization Engine',
    description: 'Continuous improvement loop for all marketing activities based on real-time data',
    category: 'analytics',
    enabled: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['optimization', 'analytics', 'ab-testing', 'roi'],
    agents: {
      'data_analyst': 'Grok-4.1-fast - Cross-channel analytics',
      'optimization_specialist': 'Claude Code - A/B testing & adjustments',
      'budget_manager': 'KAEL-3025 - Dynamic resource allocation'
    },
    steps: [
      {
        id: 'aggregate-performance-data',
        name: 'Aggregate Performance Data',
        type: 'api_call',
        description: 'Collect real-time data from email, social, SEO, and referral channels',
        agent: 'data_analyst',
        timeout: 45000
      },
      {
        id: 'identify-optimization-targets',
        name: 'Identify Optimization Targets',
        type: 'agent_task',
        description: 'Identify underperforming campaigns and high-potential opportunities',
        agent: 'data_analyst',
        requires_llm: true,
        depends_on: ['aggregate-performance-data'],
        timeout: 45000
      },
      {
        id: 'run-ab-test-cycle',
        name: 'Run A/B Test Cycle',
        type: 'agent_task',
        description: 'Generate and deploy A/B test variations for underperforming content',
        agent: 'optimization_specialist',
        requires_llm: true,
        depends_on: ['identify-optimization-targets'],
        timeout: 60000
      },
      {
        id: 'reallocate-resources',
        name: 'Reallocate Resources',
        type: 'api_call',
        description: 'Shift marketing focus and budget to high-performing channels and campaigns',
        agent: 'budget_manager',
        depends_on: ['run-ab-test-cycle'],
        timeout: 30000
      },
      {
        id: 'generate-performance-report',
        name: 'Generate Performance Report',
        type: 'agent_task',
        description: 'Create comprehensive multi-channel performance report with actionable insights',
        agent: 'data_analyst',
        requires_llm: true,
        depends_on: ['reallocate-resources'],
        timeout: 45000
      }
    ]
  }
];
