import { NextRequest, NextResponse } from 'next/server';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private errors: Array<{timestamp: number, operation: string, error: any, context: any}> = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 1000 metrics
    if (this.metrics.get(name)!.length > 1000) {
      this.metrics.get(name)!.shift();
    }
  }

  recordError(operation: string, error: any, context: any = {}) {
    this.errors.push({
      timestamp: Date.now(),
      operation,
      error: error?.message || error,
      context
    });

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors.shift();
    }

    console.error(`🚨 ERROR in ${operation}:`, {
      error: error?.message || error,
      context,
      timestamp: new Date().toISOString(),
      stack: error?.stack
    });
  }

  getMetrics(name: string) {
    return this.metrics.get(name) || [];
  }

  getErrors() {
    return this.errors;
  }

  getAverage(name: string) {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
  }

  getStats(name: string) {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sorted = [...metrics].sort((a, b) => a - b);
    return {
      count: metrics.length,
      average: this.getAverage(name),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // Health check endpoint data
  getHealthStatus() {
    const now = Date.now();
    const last5Min = now - (5 * 60 * 1000);

    const recentErrors = this.errors.filter(e => e.timestamp > last5Min);
    const apiStats = this.getStats('api_duration');
    const dbStats = this.getStats('db_query_duration');

    return {
      status: recentErrors.length > 10 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      metrics: {
        api: apiStats,
        database: dbStats,
        errors_last_5min: recentErrors.length,
        total_errors: this.errors.length
      },
      recent_errors: recentErrors.slice(-5)
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Enhanced logging with structured data
export class Logger {
  static info(operation: string, message: string, data?: any) {
    console.log(`ℹ️ ${operation}: ${message}`, data ? { ...data, timestamp: new Date().toISOString() } : '');
  }

  static warn(operation: string, message: string, data?: any) {
    console.warn(`⚠️ ${operation}: ${message}`, data ? { ...data, timestamp: new Date().toISOString() } : '');
  }

  static error(operation: string, message: string, error?: any, data?: any) {
    console.error(`🚨 ${operation}: ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
    performanceMonitor.recordError(operation, error, data);
  }

  static performance(operation: string, duration: number, data?: any) {
    performanceMonitor.recordMetric(`${operation}_duration`, duration);
    if (duration > 1000) {
      console.warn(`🐌 SLOW ${operation}: ${duration}ms`, data);
    } else {
      console.log(`⚡ ${operation}: ${duration}ms`, data);
    }
  }
}

// Middleware for performance monitoring
export async function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  operation: string
) {
  return async (req: NextRequest) => {
    const startTime = Date.now();

    try {
      Logger.info(operation, `Started ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });

      const response = await handler(req);
      const duration = Date.now() - startTime;

      Logger.performance(operation, duration, {
        status: response.status,
        method: req.method,
        url: req.url
      });

      // Log slow requests
      if (duration > 1000) {
        Logger.warn(operation, `Slow request: ${duration}ms`, {
          url: req.url,
          method: req.method,
          status: response.status
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(operation, `Request failed after ${duration}ms`, error, {
        url: req.url,
        method: req.method
      });
      throw error;
    }
  };
}

// Security monitoring
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private suspiciousActivities: Array<{timestamp: number, type: string, details: any}> = [];

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logSuspiciousActivity(type: string, details: any) {
    this.suspiciousActivities.push({
      timestamp: Date.now(),
      type,
      details
    });

    // Keep only last 500 activities
    if (this.suspiciousActivities.length > 500) {
      this.suspiciousActivities.shift();
    }

    Logger.warn('security', `Suspicious activity: ${type}`, details);
  }

  getRecentActivities() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    return this.suspiciousActivities.filter(a => a.timestamp > last24h);
  }
}

export const securityMonitor = SecurityMonitor.getInstance();