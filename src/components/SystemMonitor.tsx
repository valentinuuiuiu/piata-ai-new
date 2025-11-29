'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SystemStatus {
  redis: boolean;
  database: boolean;
  api: boolean;
  cache: boolean;
}

interface PerformanceMetrics {
  apiResponseTime: number;
  cacheHitRate: number;
  databaseQueries: number;
  activeConnections: number;
}

interface RedisInfo {
  db0?: {
    keys?: number;
  };
  memory?: {
    used_memory_human?: string;
  };
  clients?: {
    connected_clients?: number;
  };
}

interface CacheStats {
  status: string;
  connected: boolean;
  info?: RedisInfo;
}

export default function SystemMonitor() {
  const [status, setStatus] = useState<SystemStatus>({
    redis: false,
    database: false,
    api: false,
    cache: false
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    cacheHitRate: 0,
    databaseQueries: 0,
    activeConnections: 0
  });

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check API status
      const apiStart = Date.now();
      const apiResponse = await fetch('/api/listings-optimized?limit=1');
      const apiEnd = Date.now();
      const apiTime = apiEnd - apiStart;

      const apiData = await apiResponse.json();
      const apiHealthy = apiResponse.ok && apiData.success;

      // Check cache status
      const cacheResponse = await fetch('/api/cache?action=stats');
      const cacheData = await cacheResponse.json();
      const cacheHealthy = cacheResponse.ok && cacheData.success;

      // Check performance metrics
      const perfResponse = await fetch('/api/performance?action=overview');
      const perfData = await perfResponse.json();

      setStatus({
        redis: cacheData.success && cacheData.stats?.connected,
        database: perfData.success,
        api: apiHealthy,
        cache: cacheHealthy
      });

      setMetrics({
        apiResponseTime: apiTime,
        cacheHitRate: apiData.cached ? 100 : 0,
        databaseQueries: perfData.data?.queryPerformance?.length || 0,
        activeConnections: perfData.data?.activeConnections || 0
      });

      setCacheStats(cacheData.stats);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('❌ System check failed:', error);
      setStatus({
        redis: false,
        database: false,
        api: false,
        cache: false
      });
    }
  };

  const clearCache = async (type: string) => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `clear_${type}` })
      });

      if (response.ok) {
        alert(`✅ ${type} cache cleared successfully`);
        checkSystemStatus();
      } else {
        alert('❌ Failed to clear cache');
      }
    } catch (error) {
      alert('❌ Error clearing cache');
    }
  };

  const getStatusColor = (isHealthy: boolean) => isHealthy ? 'bg-green-500' : 'bg-red-500';
  const getStatusText = (isHealthy: boolean) => isHealthy ? 'Healthy' : 'Down';

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Monitor</h1>
        <div className="flex gap-2">
          <Button onClick={checkSystemStatus} variant="outline">
            Refresh
          </Button>
          <span className="text-sm text-gray-500 self-center">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status.api)}`}></div>
              <span className="text-sm">{getStatusText(status.api)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status.redis)}`}></div>
              <span className="text-sm">{getStatusText(status.redis)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status.database)}`}></div>
              <span className="text-sm">{getStatusText(status.database)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status.cache)}`}></div>
              <span className="text-sm">{getStatusText(status.cache)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiResponseTime}ms</div>
            <p className="text-xs text-gray-500">Target: &lt;200ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate}%</div>
            <p className="text-xs text-gray-500">Redis caching active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConnections}</div>
            <p className="text-xs text-gray-500">Database connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Query Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.databaseQueries}</div>
            <p className="text-xs text-gray-500">Tracked query types</p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => clearCache('listings')} variant="outline" size="sm">
              Clear Listings Cache
            </Button>
            <Button onClick={() => clearCache('analytics')} variant="outline" size="sm">
              Clear Analytics Cache
            </Button>
            <Button onClick={() => clearCache('all')} variant="destructive" size="sm">
              Clear All Cache
            </Button>
          </div>

          {cacheStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Redis Status</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Status: <Badge variant={cacheStats.connected ? "default" : "destructive"}>
                  {cacheStats.connected ? 'Connected' : 'Disconnected'}
                </Badge></div>
                <div>Keys: {cacheStats.info?.db0?.keys || 'N/A'}</div>
                <div>Memory: {cacheStats.info?.memory?.used_memory_human || 'N/A'}</div>
                <div>Clients: {cacheStats.info?.clients?.connected_clients || 'N/A'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Improvements Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Redis Caching Implementation</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Rate Limiting</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Performance Monitoring</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Automated Testing Suite</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache Invalidation System</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}