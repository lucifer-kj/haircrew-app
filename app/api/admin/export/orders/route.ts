import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseISO, isValid } from 'date-fns'
import { Prisma } from '@prisma/client'

function toCSV(rows: string[][]): string {
  return rows
    .map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const where: Prisma.OrderWhereInput = {}
    if (start && isValid(parseISO(start))) {
      where.createdAt = { gte: parseISO(start) }
    }
    if (end && isValid(parseISO(end))) {
      where.createdAt = { lte: parseISO(end) }
    }
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    // CSV header
    const rows: string[][] = [
      [
        'Order ID',
        'Order Number',
        'Customer Name',
        'Customer Email',
        'Total',
        'Status',
        'Created At',
        'Items',
      ],
    ]
    for (const order of orders) {
      rows.push([
        order.id,
        order.orderNumber,
        order.user?.name || '',
        order.user?.email || '',
        order.total.toString(),
        order.status,
        order.createdAt.toISOString(),
        order.orderItems
          .map(item => `${item.quantity}x ${item.price} (${item.productId})`)
          .join('; '),
      ])
    }
    const csv = toCSV(rows)
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-export.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    )
  }
}
