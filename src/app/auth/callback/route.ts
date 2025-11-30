import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  // Check if OAuth provider returned an error
  if (error_param) {
    console.error('OAuth provider error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error_param}&error_description=${error_description}`)
  }

  if (code) {
    console.log('🔍 Attempting to exchange code for session...')
    console.log('Code length:', code.length)
    console.log('Origin:', origin)
    
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      console.log('✅ Session created successfully!')
      console.log('User:', data.user?.email)
      console.log('Session expires:', data.session.expires_at)
      
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
      console.error('❌ Auth code exchange failed!')
      console.error('Error message:', error?.message)
      console.error('Error status:', error?.status)
      console.error('Full error:', JSON.stringify(error, null, 2))
      
      // Redirect with detailed error info
      const errorMsg = encodeURIComponent(error?.message || 'Unknown error')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=code_exchange_failed&error_description=${errorMsg}`)
    }
  }

  // No code provided
  console.error('❌ No authorization code in callback')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_code&error_description=No authorization code provided`)
}
