import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const complaints = await prisma.helpRequest.findMany({
      where: { type: 'COMPLAINT' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(complaints)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch complaints.' }, { status: 500 })
  }
}