import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
// --- Upstash Ratelimit ---
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

export async function middleware(request: NextRequest) {
  // --- Rate limiting ---
  // Use x-forwarded-for for IP, fallback to localhost
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return new NextResponse('Too many requests', { status: 429 })
  }

  // --- Auth logic ---
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname
  const isAdminRoute = path.startsWith('/dashboard/admin')
  const isUserDashboard = path.startsWith('/dashboard/user')
  // Use structured logger
  const Logger = (await import('@/lib/logger')).default

  // Redirect unauthenticated users to /auth/signin
  if (!token && (isAdminRoute || isUserDashboard)) {
  Logger.warn('Unauthenticated access attempt', { action: 'middleware', resource: path })
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Strict admin check: must be ADMIN
  if (isAdminRoute && token?.role !== 'ADMIN') {
  Logger.warn('Unauthorized admin access', { action: 'middleware', userId: typeof token?.user === 'string' ? token.user : undefined, resource: path })
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Handle user dashboard routes - redirect to profile only if authenticated
  if (isUserDashboard && path !== '/dashboard/user/profile' && token) {
  Logger.info('User dashboard access - redirecting to profile', { action: 'middleware', userId: typeof token?.user === 'string' ? token.user : undefined, resource: path })
    const response = NextResponse.redirect(new URL('/dashboard/user/profile', request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Allow
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export const config = {
  matcher: ['/dashboard/admin/:path*', '/dashboard/user/:path*'],
}
