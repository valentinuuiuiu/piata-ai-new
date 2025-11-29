import redisCache from './redis-cache';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for Redis keys
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyPrefix: 'ratelimit',
      ...options
    };
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    await redisCache.connect();

    const key = `${this.options.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    try {
      // Get current requests in the window
      const currentRequests = await redisCache.get<number[]>(key) || [];

      // Filter out requests outside the current window
      const validRequests = currentRequests.filter(timestamp => timestamp > windowStart);

      // Check if limit exceeded
      const isAllowed = validRequests.length < this.options.maxRequests;

      if (isAllowed) {
        // Add current request timestamp
        validRequests.push(now);
        await redisCache.set(key, validRequests, Math.ceil(this.options.windowMs / 1000));
      }

      const resetTime = windowStart + this.options.windowMs;

      return {
        allowed: isAllowed,
        remaining: Math.max(0, this.options.maxRequests - validRequests.length),
        resetTime,
        totalRequests: validRequests.length
      };
    } catch (error) {
      console.error('❌ Rate limiting error:', error);
      // Allow request if Redis fails
      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime: now + this.options.windowMs,
        totalRequests: 1
      };
    }
  }

  // Middleware function for Next.js API routes
  async middleware(identifier: string) {
    const result = await this.checkLimit(identifier);

    if (!result.allowed) {
      const resetInSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
        retryAfter: resetInSeconds,
        limit: this.options.maxRequests,
        remaining: result.remaining,
        resetTime: result.resetTime
      };
    }

    return null; // No error, proceed
  }
}

// Pre-configured rate limiters
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyPrefix: 'api'
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  keyPrefix: 'auth'
});

export const searchRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute
  keyPrefix: 'search'
});

// Helper function to get client identifier (IP address)
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for production with reverse proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = request.headers.get('x-client-ip');

  // Use the first available IP
  const ip = forwardedFor?.split(',')[0]?.trim() ||
             realIp ||
             clientIp ||
             'unknown';

  return ip;
}

export default RateLimiter;