'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AccessibleLoadingSpinner } from '@/components/ui/accessibility'

export default function AuthGuard({ children, requiredRole = 'ADMIN' }: {
  children: React.ReactNode
  requiredRole?: string
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (requiredRole && session.user.role !== requiredRole)) {
      // Redirect to signin with expiry reason and deep link
      router.replace(`/auth/signin?reason=expired&redirect=${encodeURIComponent(pathname)}`)
    }
  }, [session, status, router, requiredRole, pathname])

  if (status === 'loading') {
    return <AccessibleLoadingSpinner label="Checking authentication..." />
  }
  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return <AccessibleLoadingSpinner label="Redirecting to sign in..." />
  }

  return <>{children}</>
} 