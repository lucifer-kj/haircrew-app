import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
      },
    })
    return NextResponse.json(orders)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 })
  }
} 