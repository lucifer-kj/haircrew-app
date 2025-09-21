import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { z } from 'zod'
import Logger from '@/lib/logger'
import type { Session } from 'next-auth'

// Zod schemas for validation
const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100).optional(),
})
const storeSchema = z.object({
  storeName: z.string().min(1).max(100),
  storeLogo: z.string().optional(),
  storeContact: z.string().email(),
  storeAddress: z.string().max(300),
})
const paymentSchema = z.object({
  upiId: z.string().max(100).optional(),
  stripeKey: z.string().max(200).optional(),
  stripePublishable: z.string().max(200).optional(),
})
const notificationsSchema = z.object({
  orderNotifications: z.boolean(),
  stockAlerts: z.boolean(),
  emailNotifications: z.boolean(),
})

const settingsSchema = z.object({
  profile: profileSchema.optional(),
  store: storeSchema.optional(),
  payment: paymentSchema.optional(),
  notifications: notificationsSchema.optional(),
})

// Helper: get settings from DB
async function getSettings() {
  // Settings table: key-value (string, JSON, etc.)
  const settingsRows = await prisma.setting.findMany() // changed to correct model name
  const settings: Record<string, unknown> = {}
  for (const row of settingsRows) {
    try {
      settings[row.key] = JSON.parse(row.value)
    } catch {
      settings[row.key] = row.value
    }
  }
  return settings
}

// Helper: update settings in DB
async function updateSettings(updates: Record<string, unknown>) {
  for (const key of Object.keys(updates)) {
    await prisma.setting.upsert({ // changed to correct model name
      where: { key },
      update: { value: JSON.stringify(updates[key]) },
      create: { key, value: JSON.stringify(updates[key]) },
    })
  }
}

export async function GET(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Get admin profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true }
    })
    // Get settings
    const settings = await getSettings()
    return NextResponse.json({
      profile: user,
      store: settings.store || {},
      payment: settings.payment || {},
      notifications: settings.notifications || {},
    })
  } catch (e) {
    Logger.error('Settings fetch failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const validation = settingsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 })
    }
    const { profile, store, payment, notifications } = validation.data
    // Update profile
    if (profile) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: profile.name,
          email: profile.email,
          ...(profile.password ? { password: profile.password } : {}),
        },
      })
    }
    // Update settings
    const updates: Record<string, unknown> = {}
    if (store) updates.store = store
    if (payment) updates.payment = payment
    if (notifications) updates.notifications = notifications
    if (Object.keys(updates).length > 0) {
      await updateSettings(updates)
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    Logger.error('Settings update failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
} 