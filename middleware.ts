import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const isLoginPage = req.nextUrl.pathname === '/login'
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')
  const isCronRoute = req.nextUrl.pathname.startsWith('/api/cron')
  const isPublicAsset = req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/icons') ||
    req.nextUrl.pathname === '/manifest.json' ||
    req.nextUrl.pathname === '/sw.js'

  // Cron routes authenticate via Bearer token (handled in the route itself)
  if (isCronRoute || isPublicAsset) return res

  // API routes — return 401 if not authenticated
  if (isApiRoute && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // App routes — redirect to login if not authenticated
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Already logged in, trying to visit login page
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
