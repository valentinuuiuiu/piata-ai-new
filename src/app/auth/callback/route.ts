import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      console.log('✅ Session created for user:', data.user?.email)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Build redirect URL
      let redirectUrl: string
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      // Create response with proper headers to persist session
      const response = NextResponse.redirect(redirectUrl)
      
      // Set session cookies explicitly
      response.cookies.set({
        name: 'sb-access-token',
        value: data.session.access_token,
        path: '/',
        sameSite: 'lax',
        secure: !isLocalEnv,
        httpOnly: false,
      })
      
      response.cookies.set({
        name: 'sb-refresh-token',
        value: data.session.refresh_token,
        path: '/',
        sameSite: 'lax',
        secure: !isLocalEnv,
        httpOnly: false,
      })
      
      return response
    } else {
      console.error('Auth code exchange error:', error)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
