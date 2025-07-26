import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Public: get all carousel images
  const images = await prisma.carouselImage.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(images, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { url, altText } = await req.json();
  const image = await prisma.carouselImage.create({
    data: {
      url,
      altText: altText || '',
      createdBy: session.user.id,
    },
  });
  return NextResponse.json(image);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  await prisma.carouselImage.delete({
    where: { id },
  });
  return new NextResponse(null, { status: 204 });
} 