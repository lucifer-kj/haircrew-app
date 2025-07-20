import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Logger from '@/lib/logger'

export class DashboardError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
  }
}

export const handleApiError = (error: unknown, request: NextRequest, userId?: string) => {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

  if (error instanceof DashboardError) {
    Logger.warn(`DashboardError: ${error.code}`, {
      userId,
      ip,
      ...error.context
    })
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    Logger.error('Unexpected dashboard error', error, {
      userId,
      ip
    })
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  Logger.error('Unknown dashboard error', new Error('Unknown error'), { userId, ip })
  return NextResponse.json(
    { error: 'Unknown error occurred', code: 'UNKNOWN_ERROR' },
    { status: 500 }
  )
} 