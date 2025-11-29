'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  totalActiveListings: number;
  totalUsers: number;
  newListingsToday: number;
  averagePrice: string;
  topCategories: Array<{ name: string; count: number }>;
}

interface TableStat {
  TABLE_NAME: string;
  Size_MB: number;
  TABLE_ROWS: number;
}

interface QueryPerformance {
  query_type: string;
  avg_time: string;
  total_queries: number;
  slow_queries: number;
  query_count: number;
  max_time: string;
}

interface PerformanceData {
  tableStats: TableStat[];
  queryPerformance: QueryPerformance[];
  activeConnections: number;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchPerformance()]);
      setLoading(false);
    };
    
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchPerformance();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.realtime);
      }
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/performance?action=overview');
      const data = await response.json();
      if (data.success) {
        setPerformance(data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch performance:', error);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace Analytics</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.totalActiveListings || 0}</div>
            <p className="text-blue-100 text-sm">Live marketplace items</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-green-100 text-sm">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">New Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.newListingsToday || 0}</div>
            <p className="text-purple-100 text-sm">Listings added today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{analytics?.averagePrice || '0'}</div>
            <p className="text-orange-100 text-sm">Average listing price</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.topCategories?.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {category.count} listings
                </span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performance && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Connections</span>
                  <span className="font-semibold">{performance.activeConnections}</span>
                </div>
                
                {performance.queryPerformance?.map((query, index) => (
                  <div key={index} className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{query.query_type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parseFloat(query.avg_time) > 100 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {parseFloat(query.avg_time).toFixed(2)}ms avg
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {query.query_count} queries • {parseFloat(query.max_time).toFixed(2)}ms max
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Table Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performance.tableStats?.slice(0, 5).map((table, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{table.TABLE_NAME}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{table.Size_MB} MB</div>
                      <div className="text-xs text-gray-600">{table.TABLE_ROWS} rows</div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No table data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}