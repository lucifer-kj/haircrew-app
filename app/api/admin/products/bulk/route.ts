import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (
      !session?.user ||
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { action, ids } = body as { action: string; ids: string[] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      )
    }
    let result
    switch (action) {
      case 'delete':
        result = await prisma.product.deleteMany({ where: { id: { in: ids } } })
        break
      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        })
        break
      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    return NextResponse.json({ success: true, result })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
  }
}
