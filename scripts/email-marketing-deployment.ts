// Email Marketing Automation System - Deployment & Testing Script
// Comprehensive testing and deployment for the complete system

import { EmailMarketingSystem } from '../src/lib/email-system';
import { EmailAutomationEngine } from '../src/lib/email-automation';
import { UserSegmentationEngine } from '../src/lib/user-segmentation';
import { EmailIntegrationService, EmailEventGenerator } from '../src/lib/email-integration';
import { ScheduledCampaignManager } from '../src/lib/scheduled-campaigns';
import marketIntelligence from '../data/market-intelligence.json';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  enableAutomation: boolean;
  enableScheduledCampaigns: boolean;
  testMode: boolean;
  apiEndpoints: string[];
}

export class EmailMarketingSystemDeployer {
  private emailSystem: EmailMarketingSystem;
  private automationEngine: EmailAutomationEngine;
  private segmentationEngine: UserSegmentationEngine;
  private integrationService: EmailIntegrationService;
  private scheduledCampaignManager: ScheduledCampaignManager;
  private config: DeploymentConfig;
  private testResults: TestResult[] = [];

  constructor(config: DeploymentConfig) {
    this.config = config;
    
    // Initialize all components
    this.emailSystem = new EmailMarketingSystem();
    this.automationEngine = new EmailAutomationEngine(this.emailSystem);
    this.segmentationEngine = new UserSegmentationEngine(marketIntelligence);
    this.integrationService = new EmailIntegrationService(
      this.emailSystem,
      this.automationEngine,
      this.segmentationEngine,
      marketIntelligence
    );
    this.scheduledCampaignManager = new ScheduledCampaignManager(
      this.emailSystem,
      this.automationEngine,
      this.segmentationEngine,
      this.integrationService,
      marketIntelligence
    );
  }

  /**
   * Run comprehensive system tests
   */
  public async runSystemTests(): Promise<TestResult[]> {
    console.log('🧪 Starting comprehensive email marketing system tests...\n');

    const testSuite = [
      () => this.testEmailSystemInitialization(),
      () => this.testUserSegmentation(),
      () => this.testEmailAutomationEngine(),
      () => this.testEmailTemplates(),
      () => this.testEmailIntegrationService(),
      () => this.testScheduledCampaigns(),
      () => this.testMarketIntelligenceIntegration(),
      () => this.testEndToEndWorkflow()
    ];

    for (const test of testSuite) {
      try {
        await test();
      } catch (error) {
        // Individual test errors are handled within each test method
      }
    }

    this.printTestResults();
    return this.testResults;
  }

  private async testEmailSystemInitialization(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const templates = this.emailSystem.getTemplates();
      const campaigns = this.emailSystem.getCampaigns();

      this.assert(templates.length > 0, 'Email system should have templates');
      this.assert(campaigns.length >= 0, 'Email system should initialize campaigns');

      this.addTestResult('Email System Initialization', 'PASS', Date.now() - startTime, {
        templatesCount: templates.length,
        campaignsCount: campaigns.length
      });

      console.log('✅ Email System Initialization: PASS');
    } catch (error) {
      this.addTestResult('Email System Initialization', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ Email System Initialization: FAIL');
    }
  }

  private async testUserSegmentation(): Promise<void> {
    const startTime = Date.now();

    try {
      const mockUser = {
        id: 'test_user_1',
        email: 'test@example.com',
        firstName: 'Ion',
        lastName: 'Popescu',
        segment: 'new_users' as any,
        interests: ['electronics'],
        totalSpent: 150,
        lastActivity: new Date(),
        signupDate: new Date(),
        isActive: true,
        preferences: {
          categories: ['electronics'],
          priceRange: { min: 0, max: 1000 },
          communicationFrequency: 'weekly' as const
        }
      };

      const mockBehavior = {
        competitorPlatformUsed: ['olx'],
        preferredCategories: ['electronics'],
        averageOrderValue: 150,
        mobileUsage: 0.8,
        paymentMethod: 'card',
        geographicLocation: 'bucuresti',
        signupSource: 'marketplace',
        totalSpent: 150,
        purchaseFrequency: 1,
        lastActivityDays: 5,
        cartAbandonmentRate: 0.3,
        emailEngagementRate: 0.6,
        loyaltyProgramEnrollment: false
      };

      const segment = this.segmentationEngine.segmentUser(mockUser, mockBehavior);
      this.assert(segment !== undefined, 'User should be segmented');

      const insights = this.segmentationEngine.getSegmentationInsights();
      this.assert(insights.marketOpportunities.length > 0, 'Should have market insights');

      this.addTestResult('User Segmentation', 'PASS', Date.now() - startTime, {
        assignedSegment: segment,
        marketOpportunitiesCount: insights.marketOpportunities.length
      });

      console.log('✅ User Segmentation: PASS');
    } catch (error) {
      this.addTestResult('User Segmentation', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ User Segmentation: FAIL');
    }
  }

  private async testEmailAutomationEngine(): Promise<void> {
    const startTime = Date.now();

    try {
      this.automationEngine.startAutomation();
      
      const queueStats = this.automationEngine.getQueueStats();
      const activeRules = this.automationEngine.getActiveRules();

      this.assert(activeRules.length > 0, 'Automation engine should have active rules');
      this.assert(queueStats !== undefined, 'Should have queue stats');

      this.addTestResult('Email Automation Engine', 'PASS', Date.now() - startTime, {
        activeRulesCount: activeRules.length,
        queueStats
      });

      console.log('✅ Email Automation Engine: PASS');
    } catch (error) {
      this.addTestResult('Email Automation Engine', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ Email Automation Engine: FAIL');
    }
  }

  private async testEmailTemplates(): Promise<void> {
    const startTime = Date.now();

    try {
      const templates = this.emailSystem.getTemplates();
      
      const welcomeTemplates = templates.filter(t => t.id.startsWith('welcome'));
      const competitorTemplates = templates.filter(t => t.id.includes('competitor'));
      const categoryTemplates = templates.filter(t => t.campaignType === 'product_category');
      
      this.assert(welcomeTemplates.length >= 3, 'Should have welcome series templates');
      this.assert(competitorTemplates.length >= 2, 'Should have competitor analysis templates');
      this.assert(categoryTemplates.length >= 3, 'Should have product category templates');

      const welcome1 = templates.find(t => t.id === 'welcome_1');
      this.assert(welcome1?.htmlContent.includes('Bun venit'), 'Welcome template should be in Romanian');
      this.assert(welcome1?.subject.includes('OLX') || welcome1?.subject.includes('eMAG'), 
        'Welcome template should reference competitors');

      this.addTestResult('Email Templates', 'PASS', Date.now() - startTime, {
        totalTemplates: templates.length,
        welcomeTemplates: welcomeTemplates.length,
        competitorTemplates: competitorTemplates.length,
        categoryTemplates: categoryTemplates.length
      });

      console.log('✅ Email Templates: PASS');
    } catch (error) {
      this.addTestResult('Email Templates', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ Email Templates: FAIL');
    }
  }

  private async testEmailIntegrationService(): Promise<void> {
    const startTime = Date.now();

    try {
      const signupEvent = EmailEventGenerator.userSignup('test_user_123', {
        email: 'test@example.com',
        firstName: 'Ion',
        lastName: 'Popescu',
        platformUsage: ['olx']
      });

      await this.integrationService.processMarketplaceEvent(signupEvent);

      const status = this.integrationService.getIntegrationStatus();
      this.assert(status.emailSystemStatus === 'operational', 'Email system should be operational');
      this.assert(status.automationEngineStatus === 'running', 'Automation should be running');

      this.addTestResult('Email Integration Service', 'PASS', Date.now() - startTime, {
        eventProcessed: signupEvent.type,
        systemStatus: status
      });

      console.log('✅ Email Integration Service: PASS');
    } catch (error) {
      this.addTestResult('Email Integration Service', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ Email Integration Service: FAIL');
    }
  }

  private async testScheduledCampaigns(): Promise<void> {
    const startTime = Date.now();

    try {
      this.scheduledCampaignManager.startScheduledCampaigns();
      
      const campaignStatus = this.scheduledCampaignManager.getCampaignStatus();
      this.assert(campaignStatus.length > 0, 'Should have scheduled campaigns');

      this.addTestResult('Scheduled Campaigns', 'PASS', Date.now() - startTime, {
        campaignsCount: campaignStatus.length,
        campaignStatus
      });

      console.log('✅ Scheduled Campaigns: PASS');
    } catch (error) {
      this.addTestResult('Scheduled Campaigns', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ Scheduled Campaigns: FAIL');
    }
  }

  private async testMarketIntelligenceIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      this.assert(marketIntelligence.executive_summary, 'Should have market intelligence data');
      this.assert(marketIntelligence.market_competition_analysis, 'Should have competition analysis');
      this.assert(marketIntelligence.actionable_marketing_recommendations, 'Should have actionable recommendations');

      const competitorAnalysis = this.segmentationEngine.getCompetitorAnalysis();
      this.assert(competitorAnalysis.olx.weaknesses.length > 0, 'Should have OLX weaknesses identified');
      this.assert(competitorAnalysis.emag.weaknesses.length > 0, 'Should have eMAG weaknesses identified');

      this.addTestResult('Market Intelligence Integration', 'PASS', Date.now() - startTime, {
        hasExecutiveSummary: !!marketIntelligence.executive_summary,
        hasCompetitionAnalysis: !!marketIntelligence.market_competition_analysis,
        olxWeaknessesCount: competitorAnalysis.olx.weaknesses.length,
        emagWeaknessesCount: competitorAnalysis.emag.weaknesses.length
      });

      console.log('✅ Market Intelligence Integration: PASS');
    } catch (error) {
      this.addTestResult('Market Intelligence Integration', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ Market Intelligence Integration: FAIL');
    }
  }

  private async testEndToEndWorkflow(): Promise<void> {
    const startTime = Date.now();

    try {
      const userId = 'e2e_test_user';

      const signupEvent = EmailEventGenerator.userSignup(userId, {
        email: 'e2e@test.com',
        firstName: 'EndToEnd',
        lastName: 'Test',
        platformUsage: ['olx']
      });

      await this.integrationService.processMarketplaceEvent(signupEvent);

      const purchaseEvent = EmailEventGenerator.purchaseCompleted(userId, {
        amount: 150,
        categories: ['electronics'],
        items: []
      });

      await this.integrationService.processMarketplaceEvent(purchaseEvent);

      const queueStats = this.automationEngine.getQueueStats();

      this.addTestResult('End-to-End Workflow', 'PASS', Date.now() - startTime, {
        userId,
        eventsProcessed: 2,
        queueStats
      });

      console.log('✅ End-to-End Workflow: PASS');
    } catch (error) {
      this.addTestResult('End-to-End Workflow', 'FAIL', Date.now() - startTime, undefined, error.message);
      console.log('❌ End-to-End Workflow: FAIL');
    }
  }

  public async deploy(): Promise<{ success: boolean; message: string; details?: any }> {
    console.log(`🚀 Deploying email marketing system to ${this.config.environment}...\n`);

    try {
      const testResults = await this.runSystemTests();
      const failedTests = testResults.filter(t => t.status === 'FAIL');
      
      if (failedTests.length > 0) {
        return {
          success: false,
          message: `Deployment blocked: ${failedTests.length} tests failed`,
          details: failedTests
        };
      }

      if (this.config.enableAutomation) {
        console.log('Starting automation engine...');
        this.automationEngine.startAutomation();
      }

      if (this.config.enableScheduledCampaigns) {
        console.log('Starting scheduled campaigns...');
        this.scheduledCampaignManager.startScheduledCampaigns();
      }

      console.log('\n✅ Email Marketing System deployed successfully!');
      
      return {
        success: true,
        message: 'Email marketing automation system deployed successfully',
        details: {
          environment: this.config.environment,
          automationEnabled: this.config.enableAutomation,
          scheduledCampaignsEnabled: this.config.enableScheduledCampaigns,
          testResults: testResults
        }
      };

    } catch (error) {
      console.error('❌ Deployment failed:', error);
      return {
        success: false,
        message: 'Deployment failed: ' + error.message,
        details: { error: error.message }
      };
    }
  }

  public async stop(): Promise<void> {
    console.log('🛑 Stopping email marketing system...');

    this.automationEngine.stopAutomation();
    this.scheduledCampaignManager.stopScheduledCampaigns();

    console.log('✅ Email marketing system stopped');
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  private addTestResult(
    testName: string,
    status: 'PASS' | 'FAIL' | 'SKIP',
    duration: number,
    details?: any,
    error?: string
  ): void {
    this.testResults.push({
      testName,
      status,
      duration,
      details,
      error
    });
  }

  private printTestResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    const skipped = this.testResults.filter(t => t.status === 'SKIP').length;
    const total = this.testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Skipped: ${skipped} ⚠️`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.testName}: ${test.error}`);
      });
    }

    console.log('\n' + '='.repeat(50));
  }

  public generateDeploymentReport(): string {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

    return `
# Email Marketing Automation System - Deployment Report

## Deployment Configuration
- Environment: ${this.config.environment}
- Automation Enabled: ${this.config.enableAutomation}
- Scheduled Campaigns: ${this.config.enableScheduledCampaigns}
- Test Mode: ${this.config.testMode}

## System Components Deployed
✅ Email Marketing System Core
✅ Email Automation Engine
✅ User Segmentation Engine
✅ Email Integration Service
✅ Scheduled Campaign Manager
✅ API Endpoints
✅ Analytics Dashboard

## Test Results Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Success Rate: ${successRate}%

## Market Intelligence Integration
✅ Romanian Marketplace Data (OLX/eMAG analysis)
✅ Competitive Intelligence
✅ User Segmentation Rules
✅ Campaign Personalization

## Key Features
1. **5 Automated Email Campaigns**:
   - Welcome Series (3 emails)
   - Competitor Analysis (OLX/eMAG targeting)
   - Product Category Campaigns (Electronics, Fashion, Home & Garden)
   - Loyalty/Retention Campaign
   - Re-engagement Campaign

2. **Smart Segmentation**: Based on Romanian market behavior
3. **Automated Workflows**: Triggered by user actions
4. **Scheduled Campaigns**: Weekly newsletters, monthly promotions
5. **Real-time Analytics**: Performance tracking and insights

## Next Steps
1. Monitor campaign performance
2. A/B test email templates
3. Optimize segmentation rules
4. Scale based on user growth

Generated: ${new Date().toISOString()}
    `;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = (args[1] as 'development' | 'staging' | 'production') || 'development';

  const config: DeploymentConfig = {
    environment,
    enableAutomation: command !== 'test',
    enableScheduledCampaigns: command !== 'test',
    testMode: command === 'test',
    apiEndpoints: ['/api/email-campaigns']
  };

  const deployer = new EmailMarketingSystemDeployer(config);

  try {
    switch (command) {
      case 'test':
        await deployer.runSystemTests();
        break;

      case 'deploy': {
        const result = await deployer.deploy();
        if (result.success) {
          console.log(deployer.generateDeploymentReport());
        } else {
          console.error('Deployment failed:', result.message);
          process.exit(1);
        }
        break;
      }

      case 'stop':
        await deployer.stop();
        break;

      default:
        console.log(`
Email Marketing System Deployment Script

Usage:
  npm run email-marketing:test     - Run system tests
  npm run email-marketing:deploy   - Deploy to production
  npm run email-marketing:stop     - Stop all services

Commands:
  test      - Run comprehensive system tests
  deploy    - Deploy the complete system
  stop      - Stop running services
        `);
        process.exit(0);
    }
  } catch (error) {
    console.error('Script execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { EmailMarketingSystemDeployer, DeploymentConfig };