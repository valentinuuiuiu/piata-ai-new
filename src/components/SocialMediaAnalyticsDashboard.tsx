/**
 * Romanian Social Media Analytics Dashboard
 * Comprehensive analytics for Facebook, Instagram, TikTok, and LinkedIn
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlatformMetrics {
  platform: string;
  followers: number;
  reach: number;
  engagement_rate: number;
  posts_today: number;
  best_performance: {
    time: string;
    content_type: string;
    engagement: number;
  };
  target_metrics: {
    followers_target: number;
    engagement_target: number;
    reach_target: number;
  };
  current_performance: {
    followers_progress: number;
    engagement_progress: number;
    reach_progress: number;
  };
}

interface CampaignPerformance {
  campaign_name: string;
  platform: string;
  budget_spent: number;
  budget_total: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cost_per_click: number;
  roi: number;
  status: 'active' | 'paused' | 'completed';
}

interface RomanianMarketInsights {
  total_market_reach: number;
  competition_benchmark: {
    olx_engagement: number;
    emag_engagement: number;
    our_performance: number;
    market_position: 'leader' | 'challenger' | 'follower';
  };
  geographic_distribution: {
    bucuresti: number;
    cluj: number;
    timisoara: number;
    constanta: number;
    others: number;
  };
  audience_demographics: {
    age_18_24: number;
    age_25_34: number;
    age_35_44: number;
    age_45_plus: number;
  };
}

interface CompetitorAnalysis {
  competitor: string;
  followers: number;
  avg_engagement: number;
  posting_frequency: number;
  top_content: string;
  hashtag_performance: number;
  threat_level: 'low' | 'medium' | 'high';
}

export default function SocialMediaAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [platformData, setPlatformData] = useState<PlatformMetrics[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignPerformance[]>([]);
  const [marketInsights, setMarketInsights] = useState<RomanianMarketInsights | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysis[]>([]);

  useEffect(() => {
    // Initialize with Romanian market data
    initializeRomanianData();
  }, [timeRange]);

  const initializeRomanianData = () => {
    // Platform data based on market intelligence
    setPlatformData([
      {
        platform: 'Facebook',
        followers: 42000, // Target based on 4.2M market
        reach: 125000,
        engagement_rate: 0.032, // 3.2% (above market 2.8%)
        posts_today: 4,
        best_performance: {
          time: '18:00',
          content_type: 'Video',
          engagement: 0.045
        },
        target_metrics: {
          followers_target: 50000,
          engagement_target: 0.035,
          reach_target: 150000
        },
        current_performance: {
          followers_progress: 84,
          engagement_progress: 91,
          reach_progress: 83
        }
      },
      {
        platform: 'Instagram',
        followers: 28000, // Target based on 1.8M market
        reach: 85000,
        engagement_rate: 0.038, // 3.8% (above market 3.2%)
        posts_today: 3,
        best_performance: {
          time: '19:00',
          content_type: 'Reels',
          engagement: 0.065
        },
        target_metrics: {
          followers_target: 35000,
          engagement_target: 0.040,
          reach_target: 100000
        },
        current_performance: {
          followers_progress: 80,
          engagement_progress: 95,
          reach_progress: 85
        }
      },
      {
        platform: 'TikTok',
        followers: 15000, // Target based on 850K market
        reach: 95000,
        engagement_rate: 0.072, // 7.2% (above market 5.8%)
        posts_today: 2,
        best_performance: {
          time: '20:00',
          content_type: 'Challenge',
          engagement: 0.095
        },
        target_metrics: {
          followers_target: 20000,
          engagement_target: 0.070,
          reach_target: 120000
        },
        current_performance: {
          followers_progress: 75,
          engagement_progress: 103,
          reach_progress: 79
        }
      },
      {
        platform: 'LinkedIn',
        followers: 8500, // B2B focused
        reach: 25000,
        engagement_rate: 0.018, // 1.8% (above B2B average)
        posts_today: 1,
        best_performance: {
          time: '09:00',
          content_type: 'Thought Leadership',
          engagement: 0.028
        },
        target_metrics: {
          followers_target: 12000,
          engagement_target: 0.020,
          reach_target: 30000
        },
        current_performance: {
          followers_progress: 71,
          engagement_progress: 90,
          reach_progress: 83
        }
      }
    ]);

    // Campaign performance data
    setCampaignData([
      {
        campaign_name: 'OLX Competitive Campaign',
        platform: 'Facebook',
        budget_spent: 2800,
        budget_total: 3500,
        impressions: 125000,
        clicks: 3200,
        conversions: 95,
        cost_per_click: 0.88,
        roi: 2.8,
        status: 'active'
      },
      {
        campaign_name: 'Mobile-First Awareness',
        platform: 'Instagram',
        budget_spent: 1800,
        budget_total: 2500,
        impressions: 85000,
        clicks: 2800,
        conversions: 120,
        cost_per_click: 0.64,
        roi: 3.2,
        status: 'active'
      },
      {
        campaign_name: 'TikTok Viral Challenge',
        platform: 'TikTok',
        budget_spent: 1200,
        budget_total: 1500,
        impressions: 95000,
        clicks: 4200,
        conversions: 85,
        cost_per_click: 0.29,
        roi: 4.1,
        status: 'active'
      },
      {
        campaign_name: 'B2B Thought Leadership',
        platform: 'LinkedIn',
        budget_spent: 950,
        budget_total: 1200,
        impressions: 25000,
        clicks: 850,
        conversions: 28,
        cost_per_click: 1.12,
        roi: 1.9,
        status: 'active'
      }
    ]);

    // Romanian market insights
    setMarketInsights({
      total_market_reach: 325000,
      competition_benchmark: {
        olx_engagement: 0.025,
        emag_engagement: 0.030,
        our_performance: 0.041,
        market_position: 'challenger'
      },
      geographic_distribution: {
        bucuresti: 35,
        cluj: 20,
        timisoara: 15,
        constanta: 10,
        others: 20
      },
      audience_demographics: {
        age_18_24: 25,
        age_25_34: 35,
        age_35_44: 28,
        age_45_plus: 12
      }
    });

    // Competitor analysis
    setCompetitorData([
      {
        competitor: 'OLX Romania',
        followers: 4200000,
        avg_engagement: 0.025,
        posting_frequency: 5,
        top_content: 'Property listings, car sales',
        hashtag_performance: 0.028,
        threat_level: 'high'
      },
      {
        competitor: 'eMAG',
        followers: 1800000,
        avg_engagement: 0.030,
        posting_frequency: 3,
        top_content: 'Product launches, deals',
        hashtag_performance: 0.032,
        threat_level: 'medium'
      },
      {
        competitor: 'Facebook Marketplace',
        followers: 3200000,
        avg_engagement: 0.022,
        posting_frequency: 2,
        top_content: 'General marketplace',
        hashtag_performance: 0.025,
        threat_level: 'high'
      }
    ]);
  };

  const getPerformanceColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Romanian Social Media Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics for Facebook, Instagram, TikTok, and LinkedIn campaigns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === '7d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="market">Romanian Market</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">325K</div>
                <p className="text-xs text-green-600">
                  +15% vs last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">93.5K</div>
                <p className="text-xs text-green-600">
                  +8% vs last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.1%</div>
                <p className="text-xs text-green-600">
                  +0.3% vs last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Campaign ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2x</div>
                <p className="text-xs text-green-600">
                  +0.4x vs last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Engagement rates vs market benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformData.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{platform.platform}</p>
                        <p className="text-sm text-gray-500">
                          {platform.followers.toLocaleString()} followers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{(platform.engagement_rate * 100).toFixed(1)}%</p>
                        <Badge variant="secondary">Above Market</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>
                  Best performing posts this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-medium">TikTok Challenge</p>
                    <p className="text-sm text-gray-600">9.5% engagement</p>
                    <p className="text-xs text-gray-500">2.1M views</p>
                  </div>
                  <div className="border-l-4 border-pink-500 pl-4">
                    <p className="font-medium">Instagram Reel</p>
                    <p className="text-sm text-gray-600">6.5% engagement</p>
                    <p className="text-xs text-gray-500">850K views</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Facebook Video</p>
                    <p className="text-sm text-gray-600">4.5% engagement</p>
                    <p className="text-xs text-gray-500">125K views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid gap-6">
            {platformData.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">
                          {platform.platform === 'Facebook' && '📘'}
                          {platform.platform === 'Instagram' && '📷'}
                          {platform.platform === 'TikTok' && '🎵'}
                          {platform.platform === 'LinkedIn' && '💼'}
                        </span>
                        {platform.platform}
                      </CardTitle>
                      <CardDescription>
                        Romanian market performance metrics
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {platform.posts_today} posts today
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Key Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Followers</span>
                          <span className={getPerformanceColor(platform.current_performance.followers_progress)}>
                            {platform.followers.toLocaleString()} ({platform.current_performance.followers_progress}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engagement Rate</span>
                          <span className={getPerformanceColor(platform.current_performance.engagement_progress)}>
                            {(platform.engagement_rate * 100).toFixed(1)}% ({platform.current_performance.engagement_progress}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reach</span>
                          <span className={getPerformanceColor(platform.current_performance.reach_progress)}>
                            {platform.reach.toLocaleString()} ({platform.current_performance.reach_progress}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Best Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Optimal Time</span>
                          <span className="font-medium">{platform.best_performance.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Content Type</span>
                          <span className="font-medium">{platform.best_performance.content_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Peak Engagement</span>
                          <span className="font-medium">{(platform.best_performance.engagement * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Targets</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Followers Target</span>
                          <span>{platform.target_metrics.followers_target.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engagement Target</span>
                          <span>{(platform.target_metrics.engagement_target * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reach Target</span>
                          <span>{platform.target_metrics.reach_target.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Performance across Romanian market campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignData.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{campaign.campaign_name}</h4>
                        <p className="text-sm text-gray-600">{campaign.platform}</p>
                      </div>
                      <Badge className={getCampaignStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="font-medium">{campaign.budget_spent}/{campaign.budget_total} RON</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Impressions</p>
                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clicks</p>
                        <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Conversions</p>
                        <p className="font-medium">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CPC</p>
                        <p className="font-medium">{campaign.cost_per_click.toFixed(2)} RON</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ROI</p>
                        <p className="font-medium text-green-600">{campaign.roi.toFixed(1)}x</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {marketInsights && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Romanian Market Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Competition Benchmark</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Our Performance</span>
                            <span className="font-bold text-green-600">
                              {(marketInsights.competition_benchmark.our_performance * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>OLX Average</span>
                            <span>{(marketInsights.competition_benchmark.olx_engagement * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>eMAG Average</span>
                            <span>{(marketInsights.competition_benchmark.emag_engagement * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Market Position: {marketInsights.competition_benchmark.market_position}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(marketInsights.geographic_distribution).map(([city, percentage]) => (
                        <div key={city} className="flex justify-between items-center">
                          <span className="capitalize">{city}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(marketInsights.audience_demographics).map(([ageGroup, percentage]) => (
                      <div key={ageGroup} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                        <p className="text-sm text-gray-600 capitalize">{ageGroup.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
              <CardDescription>
                Monitoring OLX, eMAG, and Facebook Marketplace performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorData.map((competitor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{competitor.competitor}</h4>
                        <p className="text-sm text-gray-600">
                          {competitor.followers.toLocaleString()} followers
                        </p>
                      </div>
                      <Badge className={getThreatColor(competitor.threat_level)}>
                        {competitor.threat_level} threat
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Avg Engagement</p>
                        <p className="font-medium">{(competitor.avg_engagement * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Posts/Day</p>
                        <p className="font-medium">{competitor.posting_frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Top Content</p>
                        <p className="font-medium text-sm">{competitor.top_content}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hashtag Performance</p>
                        <p className="font-medium">{(competitor.hashtag_performance * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}