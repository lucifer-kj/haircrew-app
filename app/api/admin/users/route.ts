// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, UserRole } from '@prisma/client'
import { z } from 'zod'

// Zod schemas
const patchSchema = z.object({
  id: z.string().min(1, 'User ID required'),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

const deleteSchema = z.object({
  id: z.string().min(1, 'User ID required'),
})

// Helper function to check admin authorization
async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return { authorized: false, error: 'Not authenticated' }
  }

  if (session.user.role !== 'ADMIN') {
    return { authorized: false, error: 'Admin access required' }
  }

  return { authorized: true, session }
}

// List users (with optional search, pagination)
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

    let where: Prisma.UserWhereInput = {}
    if (search.trim()) {
      where = {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          image: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ 
      users, 
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('[ADMIN_USERS_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Update user (role, active status)
export async function PATCH(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, role } = parsed.data
    // Prevent admins from demoting themselves
    if (id === authCheck.session?.user.id && role === 'USER') {
      return NextResponse.json(
        { error: 'Cannot demote yourself' },
        { status: 400 }
      )
    }

    const data: Prisma.UserUpdateInput = {}
    if (role) {
      data.role = role as UserRole
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('[ADMIN_USERS_PATCH_ERROR]', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }

    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id } = parsed.data
    // Prevent admins from deleting themselves
    if (id === authCheck.session?.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_USERS_DELETE_ERROR]', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}