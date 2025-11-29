import { NextRequest, NextResponse } from 'next/server';

// Cache configuration
const CACHE_CONFIG = {
  // Static assets - 1 year
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  // API responses - 5 minutes
  api: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
  },
  // Dynamic content - 1 hour
  dynamic: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
  // User-specific content - no cache
  private: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  },
};

// Performance headers
const PERFORMANCE_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Cache key generator
function generateCacheKey(request: NextRequest): string {
  const url = request.nextUrl.pathname;
  const searchParams = request.nextUrl.search;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Hash the relevant parts
  const crypto = require('crypto');
  const hash = crypto
    .createHash('md5')
    .update(`${url}${searchParams}${userAgent}`)
    .digest('hex');
    
  return `${url}:${hash}`;
}

// Cache store (in-memory for now, can be extended to Redis)
const cacheStore = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache management
function setCache(key: string, data: any, ttl: number = 300): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

function getCache(key: string): any | null {
  const cached = cacheStore.get(key);
  if (!cached) return null;
  
  const age = (Date.now() - cached.timestamp) / 1000;
  if (age > cached.ttl) {
    cacheStore.delete(key);
    return null;
  }
  
  return cached.data;
}

// Compression middleware
function compressResponse(response: NextResponse): NextResponse {
  const body = response.headers.get('content-encoding');
  if (!body) {
    response.headers.set('content-encoding', 'gzip');
  }
  return response;
}

// Performance monitoring
function trackPerformance(metric: string, value: number): void {
  if (typeof window !== 'undefined') {
    // Client-side tracking
    if ('performance' in window) {
      performance.mark(`${metric}-start`);
      setTimeout(() => {
        performance.mark(`${metric}-end`);
        performance.measure(metric, `${metric}-start`, `${metric}-end`);
      }, value);
    }
  }
  
  // Server-side logging
  console.log(`[PERFORMANCE] ${metric}: ${value}ms`);
}

// Image optimization headers
const IMAGE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  'Content-Type': 'image/webp',
  'X-Content-Type-Options': 'nosniff',
};

// Bundle optimization
const BUNDLE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Content-Encoding': 'gzip',
  'X-Content-Type-Options': 'nosniff',
};

export {
  CACHE_CONFIG,
  PERFORMANCE_HEADERS,
  generateCacheKey,
  setCache,
  getCache,
  compressResponse,
  trackPerformance,
  IMAGE_HEADERS,
  BUNDLE_HEADERS,
};