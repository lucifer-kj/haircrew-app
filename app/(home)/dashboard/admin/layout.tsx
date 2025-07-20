'use client'

import AuthGuard from '@/components/admin/AuthGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="admin-layout">
        {children}
      </div>
    </AuthGuard>
  )
} 