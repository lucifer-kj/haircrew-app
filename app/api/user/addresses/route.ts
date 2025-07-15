export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const [addresses, total] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.user.id },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.address.count({ where: { userId: session.user.id } })
  ])
  return NextResponse.json({ addresses, total })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const address = await prisma.address.create({
    data: { ...data, userId: session.user.id }
  })
  return NextResponse.json(address)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  if (!data.id) return NextResponse.json({ error: "Address ID required" }, { status: 400 })
  const result = await prisma.address.updateMany({
    where: { id: data.id, userId: session.user.id },
    data: { ...data }
  })
  if (result.count === 0) return NextResponse.json({ error: "Address not found or not yours" }, { status: 404 })
  const address = await prisma.address.findUnique({ where: { id: data.id } })
  return NextResponse.json(address)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 })
  const result = await prisma.address.deleteMany({ where: { id, userId: session.user.id } })
  if (result.count === 0) return NextResponse.json({ error: "Address not found or not yours" }, { status: 404 })
  return NextResponse.json({ success: true })
} 