import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const signups = await prisma.newsletterSignup.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(signups);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch newsletter signups.' }, { status: 500 });
  }
} 