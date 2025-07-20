'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthGuard({ children, requiredRole = 'ADMIN' }: {
  children: React.ReactNode
  requiredRole?: string
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (requiredRole && session.user.role !== requiredRole)) {
      router.replace('/')
    }
  }, [session, status, router, requiredRole])

  if (status === 'loading' || !session || (requiredRole && session.user.role !== requiredRole)) {
    return <div>Loading...</div>
  }

  return <>{children}</>
} 