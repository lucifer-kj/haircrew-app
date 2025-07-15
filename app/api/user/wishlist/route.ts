export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const [wishlist, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: session.user.id },
        include: { product: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.wishlist.count({ where: { userId: session.user.id } })
    ])
    return NextResponse.json({ wishlist, total })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 })
  const exists = await prisma.wishlist.findFirst({ where: { userId: session.user.id, productId } })
  if (exists) return NextResponse.json({ error: "Already in wishlist" }, { status: 400 })
  await prisma.wishlist.create({ data: { userId: session.user.id, productId } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 })
  await prisma.wishlist.deleteMany({ where: { userId: session.user.id, productId } })
  return NextResponse.json({ success: true })
} 