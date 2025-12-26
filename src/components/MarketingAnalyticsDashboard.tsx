'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { analyticsSystem } from '@/lib/analytics-system';

interface ChannelStats {
  channel: string;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
}

interface GeoStats {
  city: string;
  users_count: number;
  conversions_count: number;
  revenue: number;
}

interface RoiStats {
  channel: string;
  spend: number;
  revenue: number;
  roi: number;
}

export default function MarketingAnalyticsDashboard() {
  const [stats, setStats] = useState<ChannelStats[]>([]);
  const [geoStats, setGeoStats] = useState<GeoStats[]>([]);
  const [roiStats, setRoiStats] = useState<RoiStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await analyticsSystem.getDashboardData();
      if (data) {
        setStats(data.stats || []);
        setGeoStats(data.geographic || []);
        setRoiStats(data.roi || []);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Marketing Analytics</h1>
          <p className="text-gray-500">Monitoring 8.5M users across all channels</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ● Live System Active
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Romanian Market: Optimized
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="roi">ROI & Budget</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white shadow-sm border-t-4 border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,542,103</div>
                <div className="text-xs text-green-600 mt-1">↑ 12% from last week</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-t-4 border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.reduce((acc, s) => acc + s.conversions, 0)}
                </div>
                <div className="text-xs text-green-600 mt-1">Real-time tracking</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-t-4 border-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">Avg CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.reduce((acc, s) => acc + s.ctr, 0) / (stats.length || 1)).toFixed(2)}%
                </div>
                <div className="text-xs text-purple-600 mt-1">Across all channels</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-t-4 border-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{roiStats.reduce((acc, s) => acc + Number(s.revenue), 0).toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 mt-1">Attributed sales</div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Channel</th>
                      <th className="px-6 py-3">Views</th>
                      <th className="px-6 py-3">Clicks</th>
                      <th className="px-6 py-3">Conversions</th>
                      <th className="px-6 py-3">CTR</th>
                      <th className="px-6 py-3">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((channel) => (
                      <tr key={channel.channel} className="bg-white border-b hover:bg-gray-50">
                        <th className="px-6 py-4 font-medium text-gray-900 capitalize">{channel.channel}</th>
                        <td className="px-6 py-4">{channel.views.toLocaleString()}</td>
                        <td className="px-6 py-4">{channel.clicks.toLocaleString()}</td>
                        <td className="px-6 py-4">{channel.conversions.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">{channel.ctr}%</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-green-50 text-green-700">{channel.conversion_rate}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Romanian Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geoStats.sort((a, b) => b.revenue - a.revenue).map((city) => (
                    <div key={city.city} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                      <div>
                        <div className="font-bold text-gray-900">{city.city}</div>
                        <div className="text-sm text-gray-500">{city.users_count} active users</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">€{city.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{city.conversions_count} conversions</div>
                      </div>
                    </div>
                  ))}
                  {geoStats.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No geographic data available for today.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900 text-white">
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-800 rounded-lg">
                  <div className="text-sm font-medium opacity-70">Mobile Usage</div>
                  <div className="text-2xl font-bold">78.4%</div>
                  <div className="text-xs opacity-50 mt-1">Optimized for Romanian mobile users</div>
                </div>
                <div className="p-4 bg-blue-800 rounded-lg">
                  <div className="text-sm font-medium opacity-70">Language Preference</div>
                  <div className="text-2xl font-bold">Romanian (92%)</div>
                  <div className="text-xs opacity-50 mt-1">Content localization success: High</div>
                </div>
                <div className="p-4 bg-blue-800 rounded-lg">
                  <div className="text-sm font-medium opacity-70">Peak Activity Time</div>
                  <div className="text-2xl font-bold">19:00 - 22:00</div>
                  <div className="text-xs opacity-50 mt-1">EET (Bucharest Time)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roiStats.map((item) => (
              <Card key={item.channel} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg capitalize">{item.channel} ROI</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Spend</span>
                    <span className="font-bold">€{item.spend}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-500">Revenue</span>
                    <span className="font-bold text-green-600">€{item.revenue}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">ROI Factor</span>
                      <Badge className={item.roi > 1 ? 'bg-green-500' : 'bg-red-500'}>
                        {item.roi.toFixed(2)}x
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
