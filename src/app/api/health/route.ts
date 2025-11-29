import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';
import { performanceMonitor, securityMonitor } from '@/lib/observability';
import { createClient } from '@/lib/supabase/server';
import Redis from 'ioredis';

export async function GET() {
  try {
    const startTime = Date.now();

    // Get comprehensive health status from observability
    const healthStatus = performanceMonitor.getHealthStatus();

    // Check database directly
    const dbHealth = await healthCheck();
    const dbStatus = dbHealth.success ? 'healthy' : 'unhealthy';

    // Check Supabase connectivity
    let supabaseStatus = 'unknown';
    let supabaseLatency = 0;
    try {
      const dbStart = Date.now();
      const supabase = await createClient();
      const { error } = await supabase.from('users').select('count').limit(1).single();
      supabaseLatency = Date.now() - dbStart;
      supabaseStatus = error ? 'error' : 'healthy';
    } catch (error) {
      supabaseStatus = 'error';
    }

    // Check Redis directly
    let redisStatus = 'unhealthy';
    let redisLatency = 0;
    try {
      const redisStart = Date.now();
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
      });
      await redis.ping();
      redisLatency = Date.now() - redisStart;
      redisStatus = 'healthy';
      redis.disconnect();
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Check external services
    const externalServices = await checkExternalServices();

    // Security status
    const securityActivities = securityMonitor.getRecentActivities();

    // Performance metrics
    const apiStats = performanceMonitor.getStats('api_duration');
    const errorStats = performanceMonitor.getStats('api_errors');

    const servicesStatus = {
      database: dbStatus,
      supabase: supabaseStatus,
      redis: redisStatus,
      ...externalServices
    };

    const hasCriticalErrors = healthStatus.metrics.errors_last_5min > 20;
    const hasServiceIssues = Object.values(servicesStatus).some(s => s !== 'healthy');
    const overallStatus = hasCriticalErrors ? 'critical' :
                         hasServiceIssues ? 'degraded' : 'healthy';
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    const healthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',

      // System resources
      system: {
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },

      // Services status
      services: {
        database: {
          status: dbStatus,
          type: 'postgresql'
        },
        supabase: {
          status: supabaseStatus,
          latency_ms: supabaseLatency,
          type: 'managed'
        },
        redis: {
          status: redisStatus,
          latency_ms: redisLatency,
          type: 'cache'
        },
        ...Object.fromEntries(
          Object.entries(externalServices).map(([service, status]) => [
            service,
            { status, type: 'external' }
          ])
        )
      },

      // Performance metrics
      performance: {
        api: apiStats,
        errors: errorStats,
        response_time_ms: Date.now() - startTime
      },

      // Security monitoring
      security: {
        suspicious_activities_24h: securityActivities.length,
        status: securityActivities.length > 10 ? 'warning' : 'normal'
      },

      // Recent errors
      errors: {
        recent: healthStatus.recent_errors,
        total_last_5min: healthStatus.metrics.errors_last_5min
      }
    };

    return NextResponse.json(healthReport, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': overallStatus
      }
    });

  } catch (error: any) {
    console.error('Health check failed:', error);
    performanceMonitor.recordError('health_check', error);
    return NextResponse.json(
      {
        status: 'critical',
        error: error.message || 'Health check system failure',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

/**
 * Check external service availability
 */
async function checkExternalServices() {
  const services = {
    openrouter: 'https://openrouter.ai/api/v1/models',
    stripe: 'https://api.stripe.com/v1/ping',
    cloudflare: 'https://1.1.1.1/api/v1/ping'
  };

  const results: Record<string, string> = {};

  for (const [service, url] of Object.entries(services)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      results[service] = response.ok ? 'healthy' : 'error';
    } catch (error) {
      results[service] = 'error';
    }
  }

  return results;
}
