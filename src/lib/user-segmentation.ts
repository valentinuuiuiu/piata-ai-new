// User Segmentation System based on OpenManus Market Intelligence
// Segments users based on Romanian marketplace behavior and competitor analysis

import { UserProfile, UserSegment } from './email-system';

interface SegmentationRule {
  segment: UserSegment;
  conditions: SegmentationCondition[];
  weight: number;
  priority: number;
}

interface SegmentationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  weight?: number;
}

interface UserBehaviorData {
  competitorPlatformUsed?: string[];
  preferredCategories: string[];
  averageOrderValue: number;
  mobileUsage: number; // 0-1 scale
  paymentMethod: string;
  geographicLocation: string;
  signupSource: string;
  totalSpent: number;
  purchaseFrequency: number; // purchases per month
  lastActivityDays: number;
  cartAbandonmentRate: number;
  emailEngagementRate: number;
  loyaltyProgramEnrollment: boolean;
}

export class UserSegmentationEngine {
  private segmentationRules: SegmentationRule[] = [];
  private marketIntelligenceData: any;

  constructor(marketIntelligenceData: any) {
    this.marketIntelligenceData = marketIntelligenceData;
    this.initializeSegmentationRules();
  }

  private initializeSegmentationRules() {
    // OLX Users (Market Leader - 8M+ monthly active users)
    this.segmentationRules.push({
      segment: UserSegment.OLX_USERS,
      priority: 1,
      weight: 10,
      conditions: [
        {
          field: 'competitorPlatformUsed',
          operator: 'contains',
          value: 'olx',
          weight: 10
        },
        {
          field: 'signupSource',
          operator: 'in',
          value: ['olx_referral', 'olx_competitor_campaign'],
          weight: 8
        },
        {
          field: 'averageOrderValue',
          operator: 'greater_than',
          value: 100,
          weight: 5
        }
      ]
    });

    // eMAG Users (B2C e-commerce leader)
    this.segmentationRules.push({
      segment: UserSegment.EMAG_USERS,
      priority: 2,
      weight: 9,
      conditions: [
        {
          field: 'competitorPlatformUsed',
          operator: 'contains',
          value: 'emag',
          weight: 10
        },
        {
          field: 'paymentMethod',
          operator: 'in',
          value: ['card', 'installment'],
          weight: 7
        },
        {
          field: 'averageOrderValue',
          operator: 'greater_than',
          value: 245,
          weight: 6
        },
        {
          field: 'loyaltyProgramEnrollment',
          operator: 'equals',
          value: true,
          weight: 8
        }
      ]
    });

    // Electronics Interested Users (32% of Romanian e-commerce sales)
    this.segmentationRules.push({
      segment: UserSegment.ELECTRONICS_INTERESTED,
      priority: 3,
      weight: 8,
      conditions: [
        {
          field: 'preferredCategories',
          operator: 'contains',
          value: 'electronics',
          weight: 10
        },
        {
          field: 'preferredCategories',
          operator: 'in',
          value: ['smartphones', 'laptops', 'gaming', 'audio', 'cameras'],
          weight: 9
        },
        {
          field: 'mobileUsage',
          operator: 'greater_than',
          value: 0.7,
          weight: 6
        }
      ]
    });

    // Fashion Interested Users (24% of Romanian e-commerce sales)
    this.segmentationRules.push({
      segment: UserSegment.FASHION_INTERESTED,
      priority: 4,
      weight: 7,
      conditions: [
        {
          field: 'preferredCategories',
          operator: 'contains',
          value: 'fashion',
          weight: 10
        },
        {
          field: 'preferredCategories',
          operator: 'in',
          value: ['clothing', 'shoes', 'accessories', 'jewelry'],
          weight: 9
        },
        {
          field: 'signupSource',
          operator: 'in',
          value: ['instagram', 'tiktok'],
          weight: 7
        }
      ]
    });

    // Home & Garden Interested Users (18% of Romanian e-commerce sales)
    this.segmentationRules.push({
      segment: UserSegment.HOME_GARDEN_INTERESTED,
      priority: 5,
      weight: 6,
      conditions: [
        {
          field: 'preferredCategories',
          operator: 'contains',
          value: 'home_garden',
          weight: 10
        },
        {
          field: 'preferredCategories',
          operator: 'in',
          value: ['furniture', 'diy', 'garden', 'appliances'],
          weight: 8
        },
        {
          field: 'geographicLocation',
          operator: 'in',
          value: ['bucuresti', 'cluj', 'timisoara', 'iasi'],
          weight: 5
        }
      ]
    });

    // High Value Users (Based on market intelligence)
    this.segmentationRules.push({
      segment: UserSegment.HIGH_VALUE_USERS,
      priority: 6,
      weight: 9,
      conditions: [
        {
          field: 'totalSpent',
          operator: 'greater_than',
          value: 1200,
          weight: 10
        },
        {
          field: 'purchaseFrequency',
          operator: 'greater_than',
          value: 2,
          weight: 8
        },
        {
          field: 'averageOrderValue',
          operator: 'greater_than',
          value: 300,
          weight: 7
        }
      ]
    });

    // Loyal Customers (Based on eMAG+ program insights)
    this.segmentationRules.push({
      segment: UserSegment.LOYAL_CUSTOMERS,
      priority: 7,
      weight: 8,
      conditions: [
        {
          field: 'loyaltyProgramEnrollment',
          operator: 'equals',
          value: true,
          weight: 10
        },
        {
          field: 'emailEngagementRate',
          operator: 'greater_than',
          value: 0.4,
          weight: 7
        },
        {
          field: 'purchaseFrequency',
          operator: 'greater_than',
          value: 1.5,
          weight: 8
        },
        {
          field: 'cartAbandonmentRate',
          operator: 'less_than',
          value: 0.3,
          weight: 6
        }
      ]
    });

    // Inactive Users (Based on market intelligence)
    this.segmentationRules.push({
      segment: UserSegment.INACTIVE_USERS,
      priority: 8,
      weight: 6,
      conditions: [
        {
          field: 'lastActivityDays',
          operator: 'greater_than',
          value: 30,
          weight: 10
        },
        {
          field: 'emailEngagementRate',
          operator: 'less_than',
          value: 0.2,
          weight: 7
        }
      ]
    });

    // New Users (Recent signups)
    this.segmentationRules.push({
      segment: UserSegment.NEW_USERS,
      priority: 9,
      weight: 7,
      conditions: [
        {
          field: 'lastActivityDays',
          operator: 'less_than',
          value: 7,
          weight: 10
        },
        {
          field: 'totalSpent',
          operator: 'equals',
          value: 0,
          weight: 8
        }
      ]
    });
  }

  public segmentUser(userProfile: UserProfile, behaviorData: UserBehaviorData): UserSegment {
    const segmentScores = new Map<UserSegment, number>();

    // Calculate scores for each rule
    this.segmentationRules.forEach(rule => {
      let ruleScore = 0;
      let allConditionsMet = true;

      rule.conditions.forEach(condition => {
        const conditionScore = this.evaluateCondition(behaviorData, condition);
        if (conditionScore > 0) {
          ruleScore += condition.weight || 1;
        } else {
          allConditionsMet = false;
        }
      });

      // Only add score if all conditions are met
      if (allConditionsMet) {
        const currentScore = segmentScores.get(rule.segment) || 0;
        segmentScores.set(rule.segment, currentScore + ruleScore);
      }
    });

    // Return the segment with highest score
    let bestSegment = UserSegment.NEW_USERS;
    let bestScore = 0;

    segmentScores.forEach((score, segment) => {
      if (score > bestScore) {
        bestScore = score;
        bestSegment = segment;
      }
    });

    return bestSegment;
  }

  private evaluateCondition(behaviorData: UserBehaviorData, condition: SegmentationCondition): number {
    const fieldValue = this.getNestedValue(behaviorData, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value ? (condition.weight || 1) : 0;
      case 'not_equals':
        return fieldValue !== condition.value ? (condition.weight || 1) : 0;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value) ? (condition.weight || 1) : 0;
      case 'less_than':
        return Number(fieldValue) < Number(condition.value) ? (condition.weight || 1) : 0;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase()) ? (condition.weight || 1) : 0;
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase()) ? (condition.weight || 1) : 0;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue) ? (condition.weight || 1) : 0;
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue) ? (condition.weight || 1) : 0;
      default:
        return 0;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public batchSegmentUsers(users: Array<{profile: UserProfile, behavior: UserBehaviorData}>): Map<UserSegment, UserProfile[]> {
    const segmentedUsers = new Map<UserSegment, UserProfile[]>();
    
    Object.values(UserSegment).forEach(segment => {
      segmentedUsers.set(segment, []);
    });

    users.forEach(({profile, behavior}) => {
      const segment = this.segmentUser(profile, behavior);
      segmentedUsers.get(segment)?.push(profile);
    });

    return segmentedUsers;
  }

  public getSegmentationInsights(): {
    totalUsers: number;
    segmentDistribution: Map<UserSegment, number>;
    marketOpportunities: string[];
  } {
    const marketOpportunities = [
      "78% of Romanian users access marketplaces via mobile - optimize mobile experience",
      "OLX has 8M+ users but limited premium features - opportunity for migration campaigns",
      "eMAG users average 245 RON per order - target with competitive pricing",
      "Electronics represent 32% of e-commerce sales - focus on this category",
      "Fashion users (24% of sales) prefer Instagram/TikTok - use visual marketing",
      "Home & Garden (18% of sales) concentrated in urban areas - geo-target major cities",
      "Mobile payments growing rapidly (3% current, trending up) - implement mobile wallet integration"
    ];

    return {
      totalUsers: 0,
      segmentDistribution: new Map(),
      marketOpportunities
    };
  }

  public getCompetitorAnalysis(): {
    olx: { weaknesses: string[]; opportunities: string[]; targetingStrategy: string; };
    emag: { weaknesses: string[]; opportunities: string[]; targetingStrategy: string; };
  } {
    return {
      olx: {
        weaknesses: [
          "Limited premium seller features",
          "Lack of integrated payment solutions", 
          "Weak logistics partnerships",
          "Limited cross-selling capabilities"
        ],
        opportunities: [
          "Target users frustrated with OLX limitations",
          "Emphasize escrow payment security",
          "Highlight superior mobile experience",
          "Offer cross-border marketplace features"
        ],
        targetingStrategy: "Position as 'next generation' marketplace with AI features and payment security"
      },
      emag: {
        weaknesses: [
          "Higher pricing compared to international competitors",
          "Limited international shipping",
          "Complex seller onboarding process"
        ],
        opportunities: [
          "Target cost-conscious eMAG users",
          "Emphasize competitive pricing (15-30% lower)",
          "Highlight easier seller onboarding",
          "Promote international shipping capabilities"
        ],
        targetingStrategy: "Focus on value proposition and shipping flexibility"
      }
    };
  }
}

// Helper function to create behavior data from user actions
export function createBehaviorDataFromActions(actions: any[]): UserBehaviorData {
  const competitorPlatforms = actions
    .filter(action => action.type === 'platform_usage')
    .map(action => action.platform);

  const categories = actions
    .filter(action => action.type === 'category_view' || action.type === 'product_view')
    .map(action => action.category);

  const orders = actions.filter(action => action.type === 'purchase');
  const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

  const emailOpens = actions.filter(action => action.type === 'email_open').length;
  const emailSends = actions.filter(action => action.type === 'email_send').length;
  const emailEngagementRate = emailSends > 0 ? emailOpens / emailSends : 0;

  return {
    competitorPlatformUsed: competitorPlatforms,
    preferredCategories: [...new Set(categories)],
    averageOrderValue,
    mobileUsage: 0.8,
    paymentMethod: 'card',
    geographicLocation: 'bucuresti',
    signupSource: 'organic',
    totalSpent,
    purchaseFrequency: orders.length / 30,
    lastActivityDays: Math.floor((Date.now() - Math.max(...actions.map(a => a.timestamp))) / (1000 * 60 * 60 * 24)) || 0,
    cartAbandonmentRate: 0.4,
    emailEngagementRate,
    loyaltyProgramEnrollment: false
  };
}