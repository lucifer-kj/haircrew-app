'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Only admins can access dashboard
  if (session.user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  } else {
    // Regular users get redirected to their profile
    redirect('/dashboard/user/profile')
  }
} 