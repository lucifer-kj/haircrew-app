export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import Logger from '@/lib/logger'

const updateEmailSchema = z.object({
  action: z.literal('UPDATE_EMAIL'),
  newEmail: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  currentPassword: z.string().min(1, 'Current password is required to verify identity'),
})

const updatePasswordSchema = z.object({
  action: z.literal('UPDATE_PASSWORD'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
})

const updateProfileSchema = z.object({
  action: z.literal('UPDATE_PROFILE'),
  name: z.string().min(1, 'Name cannot be empty').max(100),
})

const requestSchema = z.discriminatedUnion('action', [
  updateEmailSchema,
  updatePasswordSchema,
  updateProfileSchema,
])

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 })
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name || 'Admin',
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
        hasPassword: !!admin.password,
      },
    })
  } catch (error) {
    Logger.error('Admin credential details fetch failed', error as Error)
    return NextResponse.json({ error: 'Failed to fetch admin details.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid input data.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const data = parsed.data

    // Fetch existing admin record
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true, name: true, role: true },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 })
    }

    // 1. UPDATE EMAIL
    if (data.action === 'UPDATE_EMAIL') {
      if (data.newEmail === admin.email.toLowerCase()) {
        return NextResponse.json(
          { error: 'The new email is the same as your current email.' },
          { status: 400 }
        )
      }

      // Verify current password if user has one
      if (admin.password) {
        const isPasswordCorrect = await compare(data.currentPassword, admin.password)
        if (!isPasswordCorrect) {
          Logger.auth('admin_change_email_failed_password', false, admin.id, {
            ip: req.headers.get('x-forwarded-for') || 'unknown',
          })
          return NextResponse.json(
            { error: 'Current password is incorrect. Verification failed.' },
            { status: 400 }
          )
        }
      }

      // Check if email already registered to someone else
      const existingUser = await prisma.user.findUnique({
        where: { email: data.newEmail },
      })

      if (existingUser && existingUser.id !== admin.id) {
        return NextResponse.json(
          { error: 'This email is already in use by another account.' },
          { status: 400 }
        )
      }

      // Update email
      await prisma.user.update({
        where: { id: admin.id },
        data: { email: data.newEmail },
      })

      Logger.auth('admin_change_email_success', true, admin.id, {
        previousEmail: admin.email,
        newEmail: data.newEmail,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })

      return NextResponse.json({
        success: true,
        message: 'Admin email updated successfully. Please note: you must use this email for future logins.',
        email: data.newEmail,
      })
    }

    // 2. UPDATE PASSWORD
    if (data.action === 'UPDATE_PASSWORD') {
      // Verify current password
      if (admin.password) {
        const isPasswordCorrect = await compare(data.currentPassword, admin.password)
        if (!isPasswordCorrect) {
          Logger.auth('admin_change_password_failed_current', false, admin.id, {
            ip: req.headers.get('x-forwarded-for') || 'unknown',
          })
          return NextResponse.json(
            { error: 'Current password is incorrect.' },
            { status: 400 }
          )
        }
      }

      // Hash the new password with bcrypt salt rounds = 12
      const hashedPassword = await hash(data.newPassword, 12)

      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      })

      Logger.auth('admin_change_password_success', true, admin.id, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })

      return NextResponse.json({
        success: true,
        message: 'Admin password updated successfully. Your new password is now active.',
      })
    }

    // 3. UPDATE PROFILE
    if (data.action === 'UPDATE_PROFILE') {
      await prisma.user.update({
        where: { id: admin.id },
        data: { name: data.name },
      })

      return NextResponse.json({
        success: true,
        message: 'Admin profile name updated successfully.',
        name: data.name,
      })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (error) {
    Logger.error('Admin credential update failed', error as Error)
    return NextResponse.json({ error: 'Failed to update credentials. Please try again.' }, { status: 500 })
  }
}
