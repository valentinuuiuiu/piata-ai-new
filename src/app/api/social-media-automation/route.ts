/**
 * API Routes for Romanian Social Media Automation System
 * Provides REST API endpoints for managing automation across all platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { RomanianSocialMediaAutomation } from '@/lib/social-media-automation';
import { AutomatedPostingWorkflow } from '@/lib/automation/automated-posting-workflow';
import { CrossPlatformScheduler } from '@/lib/automation/cross-platform-scheduler';
import { EngagementMonitor } from '@/lib/automation/engagement-monitor';
import { CompetitorMonitor } from '@/lib/monitoring/competitor-monitor';
import { RomanianHashtagOptimizer } from '@/lib/optimization/hashtag-optimizer';

const automation = new RomanianSocialMediaAutomation();
const workflow = new AutomatedPostingWorkflow();
const scheduler = new CrossPlatformScheduler();
const engagementMonitor = new EngagementMonitor();
const competitorMonitor = new CompetitorMonitor(automation);
const hashtagOptimizer = new RomanianHashtagOptimizer(automation);

/**
 * POST /api/social-media-automation
 * Initialize and start the automation system
 */
export async function POST(request: NextRequest) {
  try {
    const { action, platform, campaignType, customContent } = await request.json();

    switch (action) {
      case 'initialize':
        await workflow.initialize();
        return NextResponse.json({ 
          success: true, 
          message: 'Romanian social media automation initialized' 
        });

      case 'start':
        await workflow.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Automation workflow started' 
        });

      case 'stop':
        await workflow.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Automation workflow stopped' 
        });

      case 'manual_post':
        if (!platform || !campaignType) {
          return NextResponse.json(
            { error: 'Platform and campaignType are required' }, 
            { status: 400 }
          );
        }

        const result = await workflow.triggerManualPost(platform, campaignType, customContent);
        return NextResponse.json({ 
          success: true, 
          data: result 
        });

      case 'schedule_campaign':
        const { startDate, duration } = await request.json();
        const scheduledPosts = await scheduler.scheduleCampaign(campaignType, new Date(startDate), duration);
        return NextResponse.json({ 
          success: true, 
          data: scheduledPosts 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social Media Automation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/social-media-automation
 * Get automation status and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const status = workflow.getStatus();
        return NextResponse.json({ success: true, data: status });

      case 'analytics':
        const analytics = await workflow.getAnalytics();
        return NextResponse.json({ success: true, data: analytics });

      case 'engagement':
        const platform = searchParams.get('platform');
        const engagementAnalytics = await engagementMonitor.getEngagementAnalytics(platform || undefined);
        return NextResponse.json({ success: true, data: engagementAnalytics });

      case 'competitors':
        const competitorData = await competitorMonitor.getCompetitiveIntelligence();
        return NextResponse.json({ success: true, data: competitorData });

      case 'hashtags':
        const hashtagPlatform = searchParams.get('platform') || 'facebook';
        const campaign = searchParams.get('campaign') || 'general';
        const hashtagStrategy = await hashtagOptimizer.getOptimizedHashtagStrategy(
          hashtagPlatform as any,
          campaign as any
        );
        return NextResponse.json({ success: true, data: hashtagStrategy });

      case 'calendar':
        const calendarAnalytics = await scheduler.getCalendarAnalytics();
        return NextResponse.json({ success: true, data: calendarAnalytics });

      default:
        const overview = {
          system_status: workflow.getStatus(),
          total_campaigns: 3,
          active_platforms: ['facebook', 'instagram', 'tiktok', 'linkedin'],
          romanian_market_data: {
            facebook_users: 4200000,
            instagram_users: 1800000,
            tiktok_users: 850000,
            linkedin_users: 1200000
          }
        };
        return NextResponse.json({ success: true, data: overview });
    }
  } catch (error) {
    console.error('Social Media Automation GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social-media-automation
 * Update automation configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const config = await request.json();
    workflow.updateConfiguration(config);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration updated successfully' 
    });
  } catch (error) {
    console.error('Social Media Automation PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}