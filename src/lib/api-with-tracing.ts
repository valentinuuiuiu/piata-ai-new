/**
 * Helper utilities for adding tracing to API routes
 * 
 * Usage:
 * ```typescript
 * import { withAPITracing } from '@/lib/api-with-tracing';
 * 
 * export async function POST(req: NextRequest) {
 *   return withAPITracing('/api/my-route', req, async (span) => {
 *     // Your handler code here
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAPISpan } from '@/lib/tracing';
import { Span } from '@opentelemetry/api';

/**
 * Wraps an API route handler with tracing
 * 
 * @param route - The API route path (e.g., '/api/my-route')
 * @param req - The NextRequest object
 * @param handler - Your async handler function
 * @returns Promise resolving to a Response
 */
export async function withAPITracing(
  route: string,
  req: NextRequest,
  handler: (span: Span) => Promise<Response>
): Promise<Response> {
  return withAPISpan(route, async (span) => {
    try {
      // Set HTTP-specific attributes
      span.setAttribute('http.method', req.method);
      span.setAttribute('http.url', req.url);
      span.setAttribute('http.target', new URL(req.url).pathname);
      
      // Extract user agent
      const userAgent = req.headers.get('user-agent');
      if (userAgent) {
        span.setAttribute('http.user_agent', userAgent);
      }

      // Execute handler
      const response = await handler(span);

      // Record response status
      span.setAttribute('http.status_code', response.status);
      span.addEvent('http.response_sent', {
        status: response.status,
        contentLength: response.headers.get('content-length') || '0',
      });

      return response;
    } catch (error) {
      // Record error
      const errorMessage = error instanceof Error ? error.message : String(error);
      span.addEvent('http.error', { error: errorMessage });
      
      // Re-throw to be handled by Next.js error boundary
      throw error;
    }
  });
}

/**
 * Create a traced JSON response
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse
 */
export function tracedResponse(data: any, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Create a traced error response
 * @param error - The error message or Error object
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse
 */
export function tracedError(error: string | Error, status = 500): NextResponse {
  const message = error instanceof Error ? error.message : error;
  return NextResponse.json(
    { error: message },
    { status }
  );
}
