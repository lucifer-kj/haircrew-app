import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const helpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
  type: z.enum(['QUERY', 'COMPLAINT']),
});

export async function GET() {
  try {
    const requests = await prisma.helpRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch help requests.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = helpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    const { name, email, message, type } = parsed.data;
    const helpRequest = await prisma.helpRequest.create({
      data: { name, email, message, type },
    });

    // Notify admin if complaint
    if (type === 'COMPLAINT') {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_COMPLAINT',
          message: `New complaint from ${name}`,
          data: { name, email, message },
        }),
      });
    }
    return NextResponse.json(helpRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit help request.' }, { status: 500 });
  }
} 