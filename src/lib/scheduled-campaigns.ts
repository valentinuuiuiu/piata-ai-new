// Scheduled Campaigns System
// Handles weekly newsletters and monthly promotions based on Romanian market intelligence

import { 
  EmailMarketingSystem, 
  EmailAutomationEngine, 
  EmailIntegrationService, 
  EmailEventGenerator,
  UserSegment, 
  TriggerType 
} from './email-system';
import { UserSegmentationEngine } from './user-segmentation';

interface ScheduledCampaign {
  id: string;
  name: string;
  type: 'weekly_newsletter' | 'monthly_promotion' | 'seasonal_campaign';
  templateId: string;
  targetSegments: UserSegment[];
  schedule: {
    frequency: 'weekly' | 'monthly' | 'custom';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
  };
  isActive: boolean;
  conditions?: {
    minUsers?: number;
    excludeSegments?: UserSegment[];
  };
}

export class ScheduledCampaignManager {
  private emailSystem: EmailMarketingSystem;
  private automationEngine: EmailAutomationEngine;
  private segmentationEngine: UserSegmentationEngine;
  private integrationService: EmailIntegrationService;
  private scheduledCampaigns: Map<string, ScheduledCampaign> = new Map();
  private activeSchedulers: Map<string, NodeJS.Timeout> = new Map();
  private marketIntelligenceData: any;

  constructor(
    emailSystem: EmailMarketingSystem,
    automationEngine: EmailAutomationEngine,
    segmentationEngine: UserSegmentationEngine,
    integrationService: EmailIntegrationService,
    marketIntelligenceData: any
  ) {
    this.emailSystem = emailSystem;
    this.automationEngine = automationEngine;
    this.segmentationEngine = segmentationEngine;
    this.integrationService = integrationService;
    this.marketIntelligenceData = marketIntelligenceData;
    this.initializeDefaultCampaigns();
  }

  private initializeDefaultCampaigns() {
    // Weekly Newsletter Campaign
    this.scheduledCampaigns.set('weekly_newsletter', {
      id: 'weekly_newsletter',
      name: 'Weekly Newsletter - Romanian Marketplace Updates',
      type: 'weekly_newsletter',
      templateId: 'weekly_newsletter_template',
      targetSegments: [
        UserSegment.NEW_USERS,
        UserSegment.ELECTRONICS_INTERESTED,
        UserSegment.FASHION_INTERESTED,
        UserSegment.HOME_GARDEN_INTERESTED
      ],
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '09:00',
        timezone: 'Europe/Bucharest'
      },
      isActive: true
    });

    // Monthly Promotional Campaign
    this.scheduledCampaigns.set('monthly_promotion', {
      id: 'monthly_promotion',
      name: 'Monthly Mega Sale - OLX/eMAG Price Comparison',
      type: 'monthly_promotion',
      templateId: 'monthly_promo_template',
      targetSegments: [
        UserSegment.OLX_USERS,
        UserSegment.EMAG_USERS,
        UserSegment.HIGH_VALUE_USERS
      ],
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '10:00',
        timezone: 'Europe/Bucharest'
      },
      isActive: true,
      conditions: {
        minUsers: 100
      }
    });
  }

  public startScheduledCampaigns(): void {
    console.log('🚀 Starting scheduled campaigns system...');

    this.scheduledCampaigns.forEach((campaign, campaignId) => {
      if (campaign.isActive) {
        this.scheduleCampaign(campaign);
      }
    });

    console.log(`✅ Started ${this.scheduledCampaigns.size} scheduled campaigns`);
  }

  public stopScheduledCampaigns(): void {
    console.log('🛑 Stopping scheduled campaigns...');

    this.activeSchedulers.forEach((scheduler, campaignId) => {
      clearInterval(scheduler);
    });

    this.activeSchedulers.clear();
    console.log('✅ Stopped all scheduled campaigns');
  }

  private scheduleCampaign(campaign: ScheduledCampaign): void {
    let intervalMs: number;

    switch (campaign.schedule.frequency) {
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'custom':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      default:
        return;
    }

    const scheduler = setInterval(async () => {
      await this.executeScheduledCampaign(campaign);
    }, intervalMs);

    this.activeSchedulers.set(campaign.id, scheduler);

    // Execute immediately for testing
    setTimeout(() => {
      this.executeScheduledCampaign(campaign);
    }, 5000);
  }

  private async executeScheduledCampaign(campaign: ScheduledCampaign): Promise<void> {
    console.log(`📧 Executing scheduled campaign: ${campaign.name}`);

    try {
      const targetUsers = await this.getTargetUsers(campaign);
      
      if (targetUsers.length < (campaign.conditions?.minUsers || 1)) {
        console.log(`⚠️ Campaign ${campaign.name} skipped: insufficient target users`);
        return;
      }

      const personalizedContent = this.generatePersonalizedContent(campaign);

      const batchSize = 50;
      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const batch = targetUsers.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (user) => {
            this.automationEngine.triggerAutomation(TriggerType.SCHEDULED, user.id, {
              campaignType: campaign.type,
              templateId: campaign.templateId,
              personalization: personalizedContent
            });
          })
        );

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`✅ Campaign ${campaign.name} executed to ${targetUsers.length} users`);

    } catch (error) {
      console.error(`❌ Failed to execute campaign ${campaign.name}:`, error);
    }
  }

  private async getTargetUsers(campaign: ScheduledCampaign): Promise<any[]> {
    const mockUsers = [
      {
        id: 'user_1',
        email: 'user1@example.com',
        firstName: 'Ion',
        lastName: 'Popescu',
        segment: UserSegment.NEW_USERS
      },
      {
        id: 'user_2',
        email: 'user2@example.com',
        firstName: 'Maria',
        lastName: 'Ionescu',
        segment: UserSegment.ELECTRONICS_INTERESTED
      },
      {
        id: 'user_3',
        email: 'user3@example.com',
        firstName: 'Alex',
        lastName: 'Radu',
        segment: UserSegment.OLX_USERS
      }
    ];

    let filteredUsers = mockUsers.filter(user =>
      campaign.targetSegments.includes(user.segment)
    );

    if (campaign.conditions?.excludeSegments) {
      filteredUsers = filteredUsers.filter(user =>
        !campaign.conditions!.excludeSegments!.includes(user.segment)
      );
    }

    return filteredUsers;
  }

  private generatePersonalizedContent(campaign: ScheduledCampaign): any {
    switch (campaign.type) {
      case 'weekly_newsletter':
        return {
          subject: 'Săptămâna ta de reduceri exclusive! 📧',
          trendingCategories: ['Electronics (32%)', 'Fashion (24%)', 'Home & Garden (18%)'],
          competitorInsights: 'Vezi de ce utilizatorii migrează de la OLX la noi',
          marketStats: {
            mobileUsers: '78% dintre utilizatorii români accesează de pe mobil',
            averageOrder: '245 RON valoare medie comandă',
            savings: '15-30% economie față de eMAG'
          }
        };

      case 'monthly_promotion':
        return {
          subject: '🚀 Mega Sale Lunar - Prețuri mai bune ca OLX și eMAG!',
          promotionType: 'Prețuri competitive cu economii de 15-30%',
          olxComparison: {
            advantage: 'Plăți escrow integrate - OLX nu are',
            mobile: 'Mobile-first experience vs. OLX basic mobile'
          },
          emagComparison: {
            advantage: 'Prețuri mai mici cu 15-30%',
            shipping: 'Transport gratuit la 99 RON vs. eMAG conditions'
          },
          urgency: 'Oferta este valabilă doar luna aceasta!'
        };

      default:
        return { subject: 'Newsletter personalizat', content: 'Conținut generat pe baza preferințelor tale' };
    }
  }

  public getCampaignStatus(): Array<{
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    nextExecution?: Date;
    targetSegments: string[];
  }> {
    return Array.from(this.scheduledCampaigns.values()).map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      isActive: campaign.isActive,
      targetSegments: campaign.targetSegments
    }));
  }
}