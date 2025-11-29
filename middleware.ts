import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ============================================================================
  // CORS HANDLING - For Extension Communication
  // ============================================================================
  if (pathname.startsWith('/api/')) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-kai-secret, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to API responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-kai-secret, Authorization');
    return response;
  }

  // ============================================================================
  // KAI PROTECTED ROUTES - Engineering the Human Mind 🧠
  // ============================================================================
  const kaiProtectedPaths = [
    '/kan',
    '/api/kai-sacred',
    '/api/agents/train',
    '/api/agents/learn'
  ]

  const isKaiRoute = kaiProtectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isKaiRoute) {
    // Check for KAI_SECRET_KEY in headers or query
    const kaiSecret = request.headers.get('x-kai-secret') ||
                      request.nextUrl.searchParams.get('kai_secret')

    if (kaiSecret !== process.env.KAI_SECRET_KEY) {
      // Check if user is authenticated with Supabase
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options) {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return NextResponse.json(
          {
            error: 'Unauthorized - KAI access requires authentication',
            message: 'Rise until the lambs became ships 🚀'
          },
          { status: 401 }
        )
      }
    }
  }

  // Continue with Supabase session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}