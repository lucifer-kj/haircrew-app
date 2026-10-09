import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize rate limiter safely only if valid credentials exist
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '10 s'),
    })
  } catch (err) {
    console.warn('Failed to initialize Upstash Redis rate limiter:', err)
  }
}

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export async function middleware(request: NextRequest) {
  // 1. Rate limiting (if configured)
  if (ratelimit) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    try {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return new NextResponse('Too many requests. Please try again shortly.', { status: 429 })
      }
    } catch {
      // In case of redis connectivity issues, do not block users
    }
  }

  // 2. Authentication & Authorization checks
  const path = request.nextUrl.pathname
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isAdminLogin = path === '/admin/login'
  const isAdminPath = path.startsWith('/dashboard/admin') || path.startsWith('/api/admin') || path === '/admin' || (path.startsWith('/admin/') && !path.startsWith('/admin/login'))
  const isUserDashboard = path.startsWith('/dashboard/user')

  // If already authenticated as admin and visiting /admin/login, redirect straight to dashboard
  if (isAdminLogin) {
    if (token?.role === 'ADMIN') {
      const response = NextResponse.redirect(new URL('/dashboard/admin', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // API Admin routes protection
  if (path.startsWith('/api/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
    }
  }

  // Admin Page protection - redirect to dedicated /admin/login
  if (isAdminPath) {
    if (!token) {
      const signInUrl = new URL('/admin/login', request.url)
      signInUrl.searchParams.set('callbackUrl', path)
      const response = NextResponse.redirect(signInUrl)
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    if (token.role !== 'ADMIN') {
      const response = NextResponse.redirect(new URL('/admin/login?error=AccessDenied', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }
  }

  // User Dashboard protection - redirect to consumer /auth/signin
  if (!token && isUserDashboard) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', path)
    const response = NextResponse.redirect(signInUrl)
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Allow request with security headers
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard/admin/:path*',
    '/dashboard/user/:path*',
    '/api/admin/:path*',
  ],
}
