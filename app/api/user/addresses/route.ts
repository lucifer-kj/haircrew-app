export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { validateInput, shippingSchema, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const [addresses, total] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.user.id },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.address.count({ where: { userId: session.user.id } }),
  ])
  return NextResponse.json({ addresses, total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(shippingSchema, body)
    if (!validation.success) {
      Logger.validation('address_creation', body, session.user.id, {
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

    const { name, phone, address, city, state, pincode, country } =
      validation.data

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      phone,
      line1: sanitizeInput(address),
      city: sanitizeInput(city),
      state: sanitizeInput(state),
      pincode,
      country: sanitizeInput(country || 'India'),
    }

    const addressRecord = await prisma.address.create({
      data: { ...sanitizedData, userId: session.user.id },
    })

    Logger.info('Address created', {
      userId: session.user.id,
      resource: addressRecord.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(addressRecord)
  } catch (error) {
    Logger.error('Address creation failed', error as Error, {
      userId: session.user.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  if (!data.id)
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
  const result = await prisma.address.updateMany({
    where: { id: data.id, userId: session.user.id },
    data: { ...data },
  })
  if (result.count === 0)
    return NextResponse.json(
      { error: 'Address not found or not yours' },
      { status: 404 }
    )
  const address = await prisma.address.findUnique({ where: { id: data.id } })
  return NextResponse.json(address)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id)
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
  const result = await prisma.address.deleteMany({
    where: { id, userId: session.user.id },
  })
  if (result.count === 0)
    return NextResponse.json(
      { error: 'Address not found or not yours' },
      { status: 404 }
    )
  return NextResponse.json({ success: true })
}
