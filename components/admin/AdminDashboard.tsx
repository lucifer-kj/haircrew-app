"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminDashboardLayout from '@/app/(home)/dashboard/admin/admin-dashboard-layout'
import { PusherProvider } from '@/components/providers/socket-provider'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { DashboardResponse } from '@/types/dashboard'

// Skeleton loader for fallback
const AdminSkeleton = () => <div className="p-8">Loading dashboard...</div>

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.replace('/dashboard/admin')
      return
    }
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const filter = searchParams.get('filter') || 'monthly'
        const res = await fetch(`/api/admin/dashboard?filter=${filter}`)
        if (!res.ok) throw new Error('Failed to fetch dashboard data')
        const data = await res.json()
        setDashboardData(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, status, router, searchParams])

  if (status === 'loading' || loading) return <AdminSkeleton />
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!dashboardData) return null

  return (
    <PusherProvider>
      <ErrorBoundary>
        <AdminDashboardLayout {...dashboardData} />
      </ErrorBoundary>
    </PusherProvider>
  )
} 