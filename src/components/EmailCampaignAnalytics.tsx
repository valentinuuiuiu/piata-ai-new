'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmailAnalytics, CampaignType, UserSegment } from '@/lib/email';

interface AnalyticsData {
  campaignId: string;
  campaignName: string;
  campaignType: CampaignType;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roi: number;
  sentAt: Date;
  segmentPerformance: Map<UserSegment, CampaignSegmentMetrics>;
}

interface CampaignSegmentMetrics {
  segment: UserSegment;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface EmailAnalyticsDashboardProps {
  marketIntelligenceData?: any;
}

export default function EmailAnalyticsDashboard({ marketIntelligenceData }: EmailAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockData = generateMockAnalyticsData();
      setAnalytics(mockData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange, selectedCampaign]);

  const generateMockAnalyticsData = (): AnalyticsData[] => {
    const campaigns: AnalyticsData[] = [
      {
        campaignId: 'welcome_series_001',
        campaignName: 'Welcome Series Campaign',
        campaignType: CampaignType.WELCOME,
        totalSent: 1250,
        totalDelivered: 1198,
        totalOpened: 743,
        totalClicked: 287,
        totalConverted: 89,
        totalUnsubscribed: 23,
        openRate: 62.0,
        clickRate: 23.9,
        conversionRate: 7.4,
        revenue: 4450,
        cost: 312,
        roi: 1326,
        sentAt: new Date('2024-12-01'),
        segmentPerformance: new Map([
          [UserSegment.NEW_USERS, {
            segment: UserSegment.NEW_USERS,
            sent: 1250,
            opened: 743,
            clicked: 287,
            converted: 89,
            revenue: 4450,
            openRate: 62.0,
            clickRate: 23.9,
            conversionRate: 7.4
          }]
        ])
      },
      {
        campaignId: 'olx_competitor_001',
        campaignName: 'OLX Competitor Migration Campaign',
        campaignType: CampaignType.COMPETITOR_ANALYSIS,
        totalSent: 3400,
        totalDelivered: 3287,
        totalOpened: 1534,
        totalClicked: 612,
        totalConverted: 187,
        totalUnsubscribed: 67,
        openRate: 46.7,
        clickRate: 18.6,
        conversionRate: 5.7,
        revenue: 9350,
        cost: 850,
        roi: 1000,
        sentAt: new Date('2024-12-02'),
        segmentPerformance: new Map([
          [UserSegment.OLX_USERS, {
            segment: UserSegment.OLX_USERS,
            sent: 3400,
            opened: 1534,
            clicked: 612,
            converted: 187,
            revenue: 9350,
            openRate: 46.7,
            clickRate: 18.6,
            conversionRate: 5.7
          }]
        ])
      },
      {
        campaignId: 'electronics_category_001',
        campaignName: 'Electronics Category Campaign',
        campaignType: CampaignType.PRODUCT_CATEGORY,
        totalSent: 2800,
        totalDelivered: 2734,
        totalOpened: 1789,
        totalClicked: 723,
        totalConverted: 156,
        totalUnsubscribed: 41,
        openRate: 65.4,
        clickRate: 26.4,
        conversionRate: 5.7,
        revenue: 12480,
        cost: 700,
        roi: 1683,
        sentAt: new Date('2024-12-03'),
        segmentPerformance: new Map([
          [UserSegment.ELECTRONICS_INTERESTED, {
            segment: UserSegment.ELECTRONICS_INTERESTED,
            sent: 2800,
            opened: 1789,
            clicked: 723,
            converted: 156,
            revenue: 12480,
            openRate: 65.4,
            clickRate: 26.4,
            conversionRate: 5.7
          }]
        ])
      },
      {
        campaignId: 'reengagement_001',
        campaignName: 'Re-engagement Campaign',
        campaignType: CampaignType.RE_ENGAGEMENT,
        totalSent: 1850,
        totalDelivered: 1821,
        totalOpened: 892,
        totalClicked: 234,
        totalConverted: 78,
        totalUnsubscribed: 145,
        openRate: 49.0,
        clickRate: 12.9,
        conversionRate: 4.3,
        revenue: 3900,
        cost: 463,
        roi: 742,
        sentAt: new Date('2024-12-04'),
        segmentPerformance: new Map([
          [UserSegment.INACTIVE_USERS, {
            segment: UserSegment.INACTIVE_USERS,
            sent: 1850,
            opened: 892,
            clicked: 234,
            converted: 78,
            revenue: 3900,
            openRate: 49.0,
            clickRate: 12.9,
            conversionRate: 4.3
          }]
        ])
      }
    ];

    return campaigns;
  };

  const calculateTotals = () => {
    return analytics.reduce((acc, campaign) => ({
      sent: acc.sent + campaign.totalSent,
      delivered: acc.delivered + campaign.totalDelivered,
      opened: acc.opened + campaign.totalOpened,
      clicked: acc.clicked + campaign.totalClicked,
      converted: acc.converted + campaign.totalConverted,
      revenue: acc.revenue + campaign.revenue,
      cost: acc.cost + campaign.cost,
      unsubscribed: acc.unsubscribed + campaign.totalUnsubscribed
    }), {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
      cost: 0,
      unsubscribed: 0
    });
  };

  const getRateColor = (rate: number, type: 'open' | 'click' | 'conversion') => {
    let threshold: string;
    switch (type) {
      case 'open':
        threshold = rate >= 50 ? 'green' : rate >= 30 ? 'yellow' : 'red';
        break;
      case 'click':
        threshold = rate >= 15 ? 'green' : rate >= 8 ? 'yellow' : 'red';
        break;
      case 'conversion':
        threshold = rate >= 5 ? 'green' : rate >= 2 ? 'yellow' : 'red';
        break;
      default:
        threshold = 'gray';
    }
    return threshold;
  };

  const totals = calculateTotals();
  const overallOpenRate = totals.delivered > 0 ? (totals.opened / totals.delivered) * 100 : 0;
  const overallClickRate = totals.opened > 0 ? (totals.clicked / totals.opened) * 100 : 0;
  const overallConversionRate = totals.clicked > 0 ? (totals.converted / totals.clicked) * 100 : 0;
  const totalROI = totals.cost > 0 ? ((totals.revenue - totals.cost) / totals.cost) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">
            Based on Romanian marketplace intelligence - {analytics.length} campaigns tracked
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totals.sent.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totals.delivered} delivered ({((totals.delivered / totals.sent) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getRateColor(overallOpenRate, 'open') === 'green' ? '#16a34a' : getRateColor(overallOpenRate, 'open') === 'yellow' ? '#ca8a04' : '#dc2626' }}>
              {overallOpenRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totals.opened} opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getRateColor(overallConversionRate, 'conversion') === 'green' ? '#16a34a' : getRateColor(overallConversionRate, 'conversion') === 'yellow' ? '#ca8a04' : '#dc2626' }}>
              {overallConversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totals.converted} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalROI.toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totals.revenue.toLocaleString()} RON revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Details</CardTitle>
          <CardDescription>
            Performance metrics for each email campaign targeting Romanian marketplace users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Sent</th>
                  <th className="text-right p-2">Open Rate</th>
                  <th className="text-right p-2">Click Rate</th>
                  <th className="text-right p-2">Conv. Rate</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((campaign) => (
                  <tr key={campaign.campaignId} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{campaign.campaignName}</div>
                      <div className="text-xs text-gray-500">{campaign.campaignId}</div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {campaign.campaignType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{campaign.totalSent.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <span style={{ color: getRateColor(campaign.openRate, 'open') === 'green' ? '#16a34a' : getRateColor(campaign.openRate, 'open') === 'yellow' ? '#ca8a04' : '#dc2626' }}>
                        {campaign.openRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <span style={{ color: getRateColor(campaign.clickRate, 'click') === 'green' ? '#16a34a' : getRateColor(campaign.clickRate, 'click') === 'yellow' ? '#ca8a04' : '#dc2626' }}>
                        {campaign.clickRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <span style={{ color: getRateColor(campaign.conversionRate, 'conversion') === 'green' ? '#16a34a' : getRateColor(campaign.conversionRate, 'conversion') === 'yellow' ? '#ca8a04' : '#dc2626' }}>
                        {campaign.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{campaign.revenue.toLocaleString()} RON</td>
                    <td className="p-2 text-right">
                      <span className={campaign.roi >= 500 ? 'text-green-600' : campaign.roi >= 200 ? 'text-yellow-600' : 'text-red-600'}>
                        {campaign.roi.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Romanian Market Intelligence Insights</CardTitle>
          <CardDescription>
            Key performance indicators based on OLX/eMAG competitive analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 Performance vs Market Benchmarks</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Our Open Rate ({overallOpenRate.toFixed(1)}%)</span>
                  <span className={overallOpenRate >= 50 ? 'text-green-600' : 'text-yellow-600'}>
                    vs 45% Romanian average
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Our Click Rate ({overallClickRate.toFixed(1)}%)</span>
                  <span className={overallClickRate >= 15 ? 'text-green-600' : 'text-yellow-600'}>
                    vs 12% benchmark
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Our Conversion ({overallConversionRate.toFixed(1)}%)</span>
                  <span className={overallConversionRate >= 5 ? 'text-green-600' : 'text-yellow-600'}>
                    vs 4% industry standard
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Targeting Effectiveness</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>OLX Migration Campaigns</span>
                  <span className="text-green-600">46.7% open rate</span>
                </li>
                <li className="flex justify-between">
                  <span>Electronics Targeting</span>
                  <span className="text-green-600">65.4% open rate</span>
                </li>
                <li className="flex justify-between">
                  <span>Re-engagement Success</span>
                  <span className="text-yellow-600">49.0% open rate</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Segment Performance</CardTitle>
          <CardDescription>
            Performance breakdown by Romanian marketplace user segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(analytics.flatMap(campaign => Array.from(campaign.segmentPerformance.keys())))).map(segment => {
              const segmentData = analytics.flatMap(campaign => Array.from(campaign.segmentPerformance.values()))
                .filter(metrics => metrics.segment === segment);
              
              const totalSent = segmentData.reduce((sum, metrics) => sum + metrics.sent, 0);
              const totalOpened = segmentData.reduce((sum, metrics) => sum + metrics.opened, 0);
              const totalRevenue = segmentData.reduce((sum, metrics) => sum + metrics.revenue, 0);
              const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

              return (
                <div key={segment} className="border rounded-lg p-4">
                  <div className="font-medium text-sm mb-2">{segment.replace('_', ' ').toUpperCase()}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total Sent:</span>
                      <span className="font-medium">{totalSent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Rate:</span>
                      <span className={`font-medium ${avgOpenRate >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {avgOpenRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">{totalRevenue.toLocaleString()} RON</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}