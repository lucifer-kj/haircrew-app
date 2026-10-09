import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export async function middleware(request: NextRequest) {

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

  // Direct /admin route shortcut
  if (path === '/admin') {
    const targetUrl = token?.role === 'ADMIN' ? '/dashboard/admin' : '/admin/login'
    const response = NextResponse.redirect(new URL(targetUrl, request.url))
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
