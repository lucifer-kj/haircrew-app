import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    });
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
} 