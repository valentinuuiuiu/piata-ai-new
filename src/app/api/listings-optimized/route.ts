import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import redisCache from '@/lib/redis-cache';
import { apiRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const CACHE_TTL = 5 * 60; // 5 minutes in seconds for Redis

const normalizeSlug = (value: string | null) => value?.trim().toLowerCase() || null;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const parseQueryInt = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

function getCacheKey(params: URLSearchParams): string {
  return `listings:${params.toString()}`;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);

  // Apply rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await apiRateLimiter.middleware(clientId);

  if (rateLimitResult) {
    return NextResponse.json(rateLimitResult, {
      status: 429,
      headers: {
        'Retry-After': rateLimitResult.retryAfter.toString(),
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });
  }

  // Initialize Redis connection
  await redisCache.connect();

  // Check Redis cache first
  const cacheKey = getCacheKey(searchParams);
  const cachedData = await redisCache.get(cacheKey);

  if (cachedData) {
    return NextResponse.json({
      ...cachedData,
      cached: true,
      cache_source: 'redis',
      execution_time: Date.now() - startTime
    });
  }

  const categorySlug = normalizeSlug(searchParams.get('category') || searchParams.get('categoria'));
  const subcategorySlug = normalizeSlug(searchParams.get('subcategory'));
  const subcategoryId = searchParams.get('subcategory_id');
  const userId = searchParams.get('userId');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const location = searchParams.get('location');

  const limit = clamp(parseQueryInt(searchParams.get('limit'), DEFAULT_LIMIT), 1, MAX_LIMIT);
  const offset = Math.max(parseQueryInt(searchParams.get('offset'), 0), 0);

  const filters: string[] = [];
  const params: (string | number)[] = [];

  if (categorySlug) {
    filters.push('c.slug = ?');
    params.push(categorySlug);
  }

  if (subcategorySlug) {
    filters.push('s.slug = ?');
    params.push(subcategorySlug);
  }

  if (subcategoryId) {
    filters.push('a.subcategory_id = ?');
    params.push(subcategoryId);
  }

  if (userId) {
    filters.push('a.user_id = ?');
    params.push(userId);
  }

  if (search) {
    filters.push('(MATCH(a.title, a.description) AGAINST(? IN NATURAL LANGUAGE MODE) OR a.title LIKE ?)');
    params.push(search, `%${search}%`);
  }

  if (minPrice) {
    filters.push('a.price >= ?');
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    filters.push('a.price <= ?');
    params.push(parseFloat(maxPrice));
  }

  if (location) {
    filters.push('a.location LIKE ?');
    params.push(`%${location}%`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  // Use optimized view for better performance
  const sqlQuery = `SELECT * FROM v_active_listings_with_details
       ${whereClause}
       ORDER BY boost_priority DESC, created_at DESC
       LIMIT ${limit}
       OFFSET ${offset}`;

  try {
    const listings = await query(sqlQuery, params);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM v_active_listings_with_details ${whereClause}`;
    const countResult = await query(countQuery, params) as any[];
    const total = countResult[0]?.total || 0;

    const response = {
      success: true,
      data: listings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      cached: false,
      cache_source: 'database',
      execution_time: Date.now() - startTime
    };

    // Cache the response in Redis
    await redisCache.set(cacheKey, response, CACHE_TTL);

    // Log performance
    await logQueryPerformance('listings_get', Date.now() - startTime, params.length, Array.isArray(listings) ? listings.length : 0);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error fetching listings:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      execution_time: Date.now() - startTime
    }, { status: 500 });
  }
}

async function logQueryPerformance(queryType: string, executionTime: number, rowsExamined: number, rowsReturned: number) {
  try {
    await query(
      `INSERT INTO query_performance (query_type, execution_time_ms, rows_examined, rows_returned)
       VALUES (?, ?, ?, ?)`,
      [queryType, executionTime, rowsExamined, rowsReturned]
    );
  } catch (error) {
    // Ignore logging errors to not affect main functionality
    console.error('❌ Failed to log query performance:', error);
  }
}