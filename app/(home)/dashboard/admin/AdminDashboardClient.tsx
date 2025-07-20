'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  {
    loading: () => <div className="p-8">Loading dashboard...</div>,
    ssr: false,
  }
)

export default function AdminDashboardClient() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  )
} 