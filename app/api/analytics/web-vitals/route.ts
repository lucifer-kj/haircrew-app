import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, id, delta, url, userAgent, timestamp } = body

    // Validate required fields
    if (!name || typeof value !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Store Web Vitals data in database
    await prisma.webVitals.create({
      data: {
        name,
        value,
        metricId: id,
        delta,
        url: url || '',
        userAgent: userAgent || '',
        timestamp: new Date(timestamp),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing Web Vitals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Optional: GET endpoint to retrieve Web Vitals data for analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const metric = searchParams.get('metric')

    const where = metric ? { name: metric } : {}

    const vitals = await prisma.webVitals.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    return NextResponse.json({ vitals })
  } catch (error) {
    console.error('Error retrieving Web Vitals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
