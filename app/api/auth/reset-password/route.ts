import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
      // Upsert token in a PasswordResetToken table (create if not exists)
      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        update: { token, expires },
        create: { userId: user.id, token, expires },
      })
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
      await sendPasswordResetEmail(user.email, user.name || '', resetUrl)
    }
    // Always return success for security
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    )
  }
}
