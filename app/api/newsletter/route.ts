import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  try {
    const signups = await prisma.newsletterSignup.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(signups);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch signups.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }
    const { email } = parsed.data;
    const existing = await prisma.newsletterSignup.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already signed up.' }, { status: 409 });
    }
    const signup = await prisma.newsletterSignup.create({ data: { email } });
    return NextResponse.json(signup, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add signup.' }, { status: 500 });
  }
} 