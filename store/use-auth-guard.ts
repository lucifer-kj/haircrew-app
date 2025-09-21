import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * useAuthGuard - Client-side auth/role protection for dashboard routes
 * @param role Optional role string (e.g., 'ADMIN')
 * @param fallbackPath Path to redirect if role does not match (default: /dashboard/user)
 */
export function useAuthGuard(role?: string, fallbackPath: string = '/dashboard/user') {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/auth/signin')
    } else if (role && session.user.role !== role) {
      router.replace(fallbackPath)
    }
  }, [session, status, role, fallbackPath, router])
} 