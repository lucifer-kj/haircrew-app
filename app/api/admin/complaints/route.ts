import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const complaints = await prisma.helpRequest.findMany({
      where: { type: 'COMPLAINT' },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(complaints);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch complaints.' }, { status: 500 });
  }
} 