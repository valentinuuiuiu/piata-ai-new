// Email System Integration Service
// Connects the email automation system with existing marketplace functionality

import { EmailMarketingSystem } from './email-system';
import { EmailAutomationEngine } from './email-automation';
import { UserSegmentationEngine } from './user-segmentation';
import { TriggerType, UserSegment } from './email-system';

interface MarketplaceEvent {
  type: 'user_signup' | 'user_purchase' | 'cart_abandoned' | 'user_inactive' | 'email_opened' | 'email_clicked' | 'purchase_completed';
  userId: string;
  timestamp: Date;
  data: any;
}

interface UserEventData {
  email?: string;
  firstName?: string;
  lastName?: string;
  totalSpent?: number;
  cartValue?: number;
  categories?: string[];
  purchaseHistory?: Array<{amount: number; category: string; date: Date}>;
  platformUsage?: string[];
}

export class EmailIntegrationService {
  private emailSystem: EmailMarketingSystem;
  private automationEngine: EmailAutomationEngine;
  private segmentationEngine: UserSegmentationEngine;
  private marketIntelligenceData: any;

  constructor(
    emailSystem: EmailMarketingSystem,
    automationEngine: EmailAutomationEngine,
    segmentationEngine: UserSegmentationEngine,
    marketIntelligenceData: any
  ) {
    this.emailSystem = emailSystem;
    this.automationEngine = automationEngine;
    this.segmentationEngine = segmentationEngine;
    this.marketIntelligenceData = marketIntelligenceData;
  }

  public async processMarketplaceEvent(event: MarketplaceEvent): Promise<void> {
    console.log(`Processing marketplace event: ${event.type} for user ${event.userId}`);

    try {
      const userEventData = this.extractUserDataFromEvent(event);
      const userProfile = await this.getOrCreateUserProfile(event.userId, userEventData);
      const behaviorData = this.createBehaviorData(event, userEventData);
      const segment = this.segmentationEngine.segmentUser(userProfile, behaviorData);
      userProfile.segment = segment;

      this.automationEngine.addUserProfile(userProfile);
      await this.triggerAutomationForEvent(event, userProfile, behaviorData);

      console.log(`Successfully processed ${event.type} event for user ${event.userId}, segment: ${segment}`);
      
    } catch (error) {
      console.error(`Failed to process marketplace event ${event.type} for user ${event.userId}:`, error);
      throw error;
    }
  }

  private async handleUserSignup(userId: string, userData: UserEventData): Promise<void> {
    this.automationEngine.triggerAutomation(TriggerType.SIGNUP, userId, {
      firstName: userData.firstName,
      email: userData.email,
      signupSource: 'marketplace'
    });

    if (userData.platformUsage?.includes('olx')) {
      this.automationEngine.triggerAutomation(TriggerType.SIGNUP, userId, {
        competitorPlatform: 'OLX',
        migrationOpportunity: true
      });
    }

    if (userData.platformUsage?.includes('emag')) {
      this.automationEngine.triggerAutomation(TriggerType.SIGNUP, userId, {
        competitorPlatform: 'eMAG',
        pricingAdvantage: true
      });
    }
  }

  private async handlePurchaseCompleted(userId: string, userData: UserEventData): Promise<void> {
    this.automationEngine.triggerAutomation(TriggerType.PURCHASE_COMPLETION, userId, {
      purchaseAmount: userData.totalSpent,
      categories: userData.categories,
      thankYouMessage: true
    });

    if (userData.totalSpent && userData.totalSpent > 500) {
      this.automationEngine.triggerAutomation(TriggerType.PURCHASE_COMPLETION, userId, {
        loyaltyUpgrade: true,
        totalSpent: userData.totalSpent
      });
    }
  }

  private async handleCartAbandoned(userId: string, userData: UserEventData): Promise<void> {
    if (userData.cartValue && userData.cartValue >= 50) {
      this.automationEngine.triggerAutomation(TriggerType.CART_ABANDONMENT, userId, {
        cartValue: userData.cartValue,
        abandonedItems: userData.categories,
        recoveryDiscount: 10
      });
    }
  }

  private async handleUserInactive(userId: string, userData: UserEventData): Promise<void> {
    this.automationEngine.triggerAutomation(TriggerType.INACTIVITY, userId, {
      lastPurchaseAmount: userData.totalSpent,
      inactivityReason: 'no_recent_activity',
      reengagementOffer: 20
    });
  }

  private async handleEmailEngagement(event: 'opened' | 'clicked', userId: string, campaignId: string): Promise<void> {
    this.automationEngine.triggerAutomation(TriggerType.SCHEDULED, userId, {
      emailEngagement: event,
      campaignId: campaignId,
      engagementScore: event === 'clicked' ? 2 : 1
    });
  }

  private extractUserDataFromEvent(event: MarketplaceEvent): UserEventData {
    const data = event.data || {};
    
    return {
      email: data.email,
      firstName: data.firstName || data.name?.split(' ')[0],
      lastName: data.lastName || data.name?.split(' ').slice(1).join(' '),
      totalSpent: data.totalSpent || data.orderTotal || 0,
      cartValue: data.cartValue || data.cartTotal || 0,
      categories: data.categories || data.productCategories || [],
      purchaseHistory: data.purchaseHistory || [],
      platformUsage: data.platformUsage || []
    };
  }

  private async getOrCreateUserProfile(userId: string, userData: UserEventData): Promise<any> {
    return {
      id: userId,
      email: userData.email || `user${userId}@example.com`,
      firstName: userData.firstName || 'Utilizator',
      lastName: userData.lastName || '',
      segment: UserSegment.NEW_USERS,
      interests: userData.categories || [],
      totalSpent: userData.totalSpent || 0,
      lastActivity: new Date(),
      signupDate: new Date(),
      isActive: true,
      preferences: {
        categories: userData.categories || [],
        priceRange: { min: 0, max: 1000 },
        communicationFrequency: 'weekly'
      }
    };
  }

  private createBehaviorData(event: MarketplaceEvent, userData: UserEventData): any {
    return {
      competitorPlatformUsed: userData.platformUsage || [],
      preferredCategories: userData.categories || [],
      averageOrderValue: userData.totalSpent || 0,
      mobileUsage: 0.8,
      paymentMethod: 'card',
      geographicLocation: 'bucuresti',
      signupSource: event.type === 'user_signup' ? 'marketplace' : 'returning',
      totalSpent: userData.totalSpent || 0,
      purchaseFrequency: userData.purchaseHistory?.length || 0,
      lastActivityDays: 0,
      cartAbandonmentRate: event.type === 'cart_abandoned' ? 1.0 : 0.4,
      emailEngagementRate: 0.5,
      loyaltyProgramEnrollment: false
    };
  }

  private async triggerAutomationForEvent(event: MarketplaceEvent, userProfile: any, behaviorData: any): Promise<void> {
    switch (event.type) {
      case 'user_signup':
        await this.handleUserSignup(event.userId, behaviorData);
        break;
      case 'purchase_completed':
      case 'user_purchase':
        await this.handlePurchaseCompleted(event.userId, behaviorData);
        break;
      case 'cart_abandoned':
        await this.handleCartAbandoned(event.userId, behaviorData);
        break;
      case 'user_inactive':
        await this.handleUserInactive(event.userId, behaviorData);
        break;
      case 'email_opened':
        await this.handleEmailEngagement('opened', event.userId, event.data.campaignId);
        break;
      case 'email_clicked':
        await this.handleEmailEngagement('clicked', event.userId, event.data.campaignId);
        break;
      default:
        console.log(`No automation handler for event type: ${event.type}`);
    }
  }

  public async batchProcessEvents(events: MarketplaceEvent[]): Promise<void> {
    console.log(`Batch processing ${events.length} marketplace events`);
    
    const batchSize = 10;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(event => this.processMarketplaceEvent(event))
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Batch processing completed');
  }

  public getIntegrationStatus(): {
    emailSystemStatus: string;
    automationEngineStatus: string;
    segmentationEngineStatus: string;
    queueStats: any;
    activeRules: number;
  } {
    return {
      emailSystemStatus: 'operational',
      automationEngineStatus: 'running',
      segmentationEngineStatus: 'active',
      queueStats: this.automationEngine.getQueueStats(),
      activeRules: this.automationEngine.getActiveRules().length
    };
  }
}

export class EmailEventGenerator {
  public static userSignup(userId: string, userData: UserEventData): MarketplaceEvent {
    return {
      type: 'user_signup',
      userId,
      timestamp: new Date(),
      data: userData
    };
  }

  public static purchaseCompleted(userId: string, purchaseData: {
    amount: number;
    categories: string[];
    items: any[];
  }): MarketplaceEvent {
    return {
      type: 'purchase_completed',
      userId,
      timestamp: new Date(),
      data: {
        totalSpent: purchaseData.amount,
        categories: purchaseData.categories,
        purchaseHistory: [{
          amount: purchaseData.amount,
          category: purchaseData.categories[0] || 'general',
          date: new Date()
        }]
      }
    };
  }

  public static cartAbandoned(userId: string, cartData: {
    cartValue: number;
    categories: string[];
    items: any[];
  }): MarketplaceEvent {
    return {
      type: 'cart_abandoned',
      userId,
      timestamp: new Date(),
      data: {
        cartValue: cartData.cartValue,
        categories: cartData.categories
      }
    };
  }

  public static userInactive(userId: string, inactiveDays: number): MarketplaceEvent {
    return {
      type: 'user_inactive',
      userId,
      timestamp: new Date(),
      data: {
        inactiveDays,
        lastActivity: new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000)
      }
    };
  }

  public static emailOpened(userId: string, campaignId: string): MarketplaceEvent {
    return {
      type: 'email_opened',
      userId,
      timestamp: new Date(),
      data: { campaignId }
    };
  }

  public static emailClicked(userId: string, campaignId: string): MarketplaceEvent {
    return {
      type: 'email_clicked',
      userId,
      timestamp: new Date(),
      data: { campaignId }
    };
  }
}