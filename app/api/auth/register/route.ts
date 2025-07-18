export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

import { validateInput, registerSchema, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(registerSchema, body)
    if (!validation.success) {
      Logger.validation('registration', body, undefined, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email).toLowerCase()
    const existing = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })
    if (existing) {
      Logger.auth('register', false, undefined, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        { error: 'Email already in use.' },
        { status: 400 }
      )
    }

    const hashed = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashed,
      },
    })

    Logger.auth('register', true, user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    Logger.error('Registration failed', e as Error, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    )
  }
}
