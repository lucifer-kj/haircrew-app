export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { validateInput, reviewSchema, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: product.id },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where: { productId: product.id } }),
    ])
    return NextResponse.json({ reviews, total })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const { slug } = await params
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(reviewSchema, body)
    if (!validation.success) {
      Logger.validation('review_creation', body, session.user.id, {
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

    const { rating, title, comment } = validation.data

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: product.id,
        },
      },
    })

    if (existingReview) {
      Logger.warn('Duplicate review attempt', {
        userId: session.user.id,
        resource: product.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedComment = sanitizeInput(comment)

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        rating,
        title: sanitizedTitle,
        comment: sanitizedComment,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    Logger.info(
      'Review created',
      {
        userId: session.user.id,
        resource: product.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      },
      { reviewId: review.id }
    )
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    Logger.error('Review creation failed', error as Error, {
      userId: session.user.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
