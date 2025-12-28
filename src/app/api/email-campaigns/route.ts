// Email Campaigns API Route
// Handles email campaign management and automation triggers

import { NextRequest, NextResponse } from 'next/server';
import { EmailMarketingSystem, EmailCampaign, TriggerType, UserSegment, CampaignType } from '@/lib/email-system';
import { EmailAutomationEngine } from '@/lib/email-automation';
import { UserSegmentationEngine, createBehaviorDataFromActions } from '@/lib/user-segmentation';

// Load market intelligence data
import marketIntelligence from '@/../data/market-intelligence.json';

// Initialize email system components
const emailSystem = new EmailMarketingSystem();
const automationEngine = new EmailAutomationEngine(emailSystem);
const segmentationEngine = new UserSegmentationEngine(marketIntelligence);

// Global instances (in production, use proper dependency injection)
let isAutomationStarted = false;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'analytics':
        return NextResponse.json({
          success: true,
          data: await getCampaignAnalytics()
        });

      case 'templates': {
        const templates = emailSystem.getTemplates();
        return NextResponse.json({
          success: true,
          data: templates
        });
      }

      case 'campaigns': {
        const campaigns = emailSystem.getCampaigns();
        return NextResponse.json({
          success: true,
          data: campaigns
        });
      }

      case 'queue-stats': {
        const queueStats = automationEngine.getQueueStats();
        return NextResponse.json({
          success: true,
          data: queueStats
        });
      }

      case 'segmentation-insights': {
        const insights = segmentationEngine.getSegmentationInsights();
        return NextResponse.json({
          success: true,
          data: insights
        });
      }

      default:
        return NextResponse.json({
          success: true,
          message: 'Email Campaign API - Available actions: analytics, templates, campaigns, queue-stats, segmentation-insights'
        });
    }
  } catch (error) {
    console.error('Email campaigns GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch email campaign data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'trigger-automation':
        return await handleTriggerAutomation(data);

      case 'create-campaign':
        return await handleCreateCampaign(data);

      case 'send-test-email':
        return await handleSendTestEmail(data);

      case 'start-automation':
        return await handleStartAutomation();

      case 'stop-automation':
        return await handleStopAutomation();

      case 'segment-user':
        return await handleSegmentUser(data);

      case 'batch-segment':
        return await handleBatchSegment(data);

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action. Available actions: trigger-automation, create-campaign, send-test-email, start-automation, stop-automation, segment-user, batch-segment'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Email campaigns POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process email campaign request'
    }, { status: 500 });
  }
}

async function handleTriggerAutomation(data: any) {
  const { triggerType, userId, userData, actions } = data;

  if (!triggerType || !userId) {
    return NextResponse.json({
      success: false,
      error: 'triggerType and userId are required'
    }, { status: 400 });
  }

  // Create user profile
  const userProfile = {
    id: userId,
    email: userData?.email || `user${userId}@example.com`,
    firstName: userData?.firstName || 'Utilizator',
    lastName: userData?.lastName || '',
    segment: UserSegment.NEW_USERS,
    interests: userData?.interests || [],
    totalSpent: userData?.totalSpent || 0,
    lastActivity: new Date(userData?.lastActivity || Date.now()),
    signupDate: new Date(userData?.signupDate || Date.now()),
    isActive: userData?.isActive !== false,
    preferences: {
      categories: userData?.preferences?.categories || [],
      priceRange: userData?.preferences?.priceRange || { min: 0, max: 1000 },
      communicationFrequency: userData?.preferences?.communicationFrequency || 'weekly'
    }
  };

  // Add user profile to automation engine
  automationEngine.addUserProfile(userProfile);

  // Create behavior data from actions
  const behaviorData = actions ? createBehaviorDataFromActions(actions) : {
    competitorPlatformUsed: [],
    preferredCategories: [],
    averageOrderValue: 0,
    mobileUsage: 0.8,
    paymentMethod: 'card',
    geographicLocation: 'bucuresti',
    signupSource: 'api',
    totalSpent: 0,
    purchaseFrequency: 0,
    lastActivityDays: 0,
    cartAbandonmentRate: 0.4,
    emailEngagementRate: 0,
    loyaltyProgramEnrollment: false
  };

  // Segment user based on behavior
  const segment = segmentationEngine.segmentUser(userProfile, behaviorData);
  userProfile.segment = segment;

  // Trigger automation
  automationEngine.triggerAutomation(
    triggerType as TriggerType,
    userId,
    { behaviorData, segment }
  );

  return NextResponse.json({
    success: true,
    message: `Automation triggered for user ${userId} with segment ${segment}`,
    data: {
      userId,
      segment,
      triggerType,
      automationStarted: true
    }
  });
}

async function handleCreateCampaign(data: any) {
  const { name, templateIds, targetSegment, triggerType, scheduling, isActive = true } = data;

  if (!name || !templateIds || !targetSegment || !triggerType) {
    return NextResponse.json({
      success: false,
      error: 'name, templateIds, targetSegment, and triggerType are required'
    }, { status: 400 });
  }

  const campaign: EmailCampaign = {
    id: `campaign_${Date.now()}`,
    name,
    templateIds: Array.isArray(templateIds) ? templateIds : [templateIds],
    targetSegment: targetSegment as UserSegment,
    triggerType: triggerType as TriggerType,
    scheduling,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  emailSystem.createCampaign(campaign);

  return NextResponse.json({
    success: true,
    message: 'Campaign created successfully',
    data: campaign
  });
}

async function handleSendTestEmail(data: any) {
  const { userId, templateId, personalizations } = data;

  if (!userId || !templateId) {
    return NextResponse.json({
      success: false,
      error: 'userId and templateId are required'
    }, { status: 400 });
  }

  // Simulate sending email
  const success = await emailSystem.sendEmail(userId, templateId, personalizations);

  return NextResponse.json({
    success: true,
    message: success ? 'Test email sent successfully' : 'Failed to send test email',
    data: { userId, templateId, success }
  });
}

async function handleStartAutomation() {
  if (isAutomationStarted) {
    return NextResponse.json({
      success: true,
      message: 'Email automation is already running'
    });
  }

  automationEngine.startAutomation();
  isAutomationStarted = true;

  return NextResponse.json({
    success: true,
    message: 'Email automation engine started successfully'
  });
}

async function handleStopAutomation() {
  if (!isAutomationStarted) {
    return NextResponse.json({
      success: true,
      message: 'Email automation is not running'
    });
  }

  automationEngine.stopAutomation();
  isAutomationStarted = false;

  return NextResponse.json({
    success: true,
    message: 'Email automation engine stopped successfully'
  });
}

async function handleSegmentUser(data: any) {
  const { userProfile, behaviorData } = data;

  if (!userProfile || !behaviorData) {
    return NextResponse.json({
      success: false,
      error: 'userProfile and behaviorData are required'
    }, { status: 400 });
  }

  const segment = segmentationEngine.segmentUser(userProfile, behaviorData);

  return NextResponse.json({
    success: true,
    message: 'User segmented successfully',
    data: {
      userId: userProfile.id,
      segment,
      confidence: 'high'
    }
  });
}

async function handleBatchSegment(data: any) {
  const { users } = data;

  if (!users || !Array.isArray(users)) {
    return NextResponse.json({
      success: false,
      error: 'users array is required'
    }, { status: 400 });
  }

  const userBehaviorPairs = users.map(user => ({
    profile: user.profile,
    behavior: user.behavior || createBehaviorDataFromActions([])
  }));

  const segmentedUsers = segmentationEngine.batchSegmentUsers(userBehaviorPairs);

  // Convert Map to object for JSON serialization
  const segmentedObject: Record<string, any> = {};
  segmentedUsers.forEach((users, segment) => {
    segmentedObject[segment] = users;
  });

  return NextResponse.json({
    success: true,
    message: 'Batch segmentation completed',
    data: {
      totalUsers: users.length,
      segmentedUsers: segmentedObject
    }
  });
}

async function getCampaignAnalytics() {
  // Simulate campaign analytics based on market intelligence
  return {
    overview: {
      totalCampaigns: 12,
      totalSent: 15850,
      averageOpenRate: 56.8,
      averageClickRate: 19.4,
      averageConversionRate: 6.2,
      totalRevenue: 89450,
      totalCost: 8930,
      roi: 901
    },
    topPerformingCampaigns: [
      {
        name: 'Electronics Category Campaign',
        openRate: 65.4,
        clickRate: 26.4,
        conversionRate: 8.1,
        revenue: 12480
      },
      {
        name: 'Welcome Series #1',
        openRate: 62.0,
        clickRate: 23.9,
        conversionRate: 7.4,
        revenue: 4450
      },
      {
        name: 'OLX Migration Campaign',
        openRate: 46.7,
        clickRate: 18.6,
        conversionRate: 5.7,
        revenue: 9350
      }
    ],
    segmentPerformance: {
      [UserSegment.ELECTRONICS_INTERESTED]: {
        users: 2840,
        openRate: 65.4,
        revenue: 12480
      },
      [UserSegment.NEW_USERS]: {
        users: 1250,
        openRate: 62.0,
        revenue: 4450
      },
      [UserSegment.OLX_USERS]: {
        users: 3400,
        openRate: 46.7,
        revenue: 9350
      }
    },
    marketBenchmarks: {
      romanianAverageOpenRate: 45,
      romanianAverageClickRate: 12,
      romanianAverageConversionRate: 4,
      ourPerformanceVsAverage: {
        openRateImprovement: 26.2,
        clickRateImprovement: 61.7,
        conversionRateImprovement: 55.0
      }
    }
  };
}
