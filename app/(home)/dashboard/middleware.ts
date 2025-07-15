import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// This middleware protects all /dashboard routes for ADMINs only
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Not signed in
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Not an admin
  if (token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
} 