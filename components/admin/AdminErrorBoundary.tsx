'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to monitoring service
    console.error('Admin Error Boundary:', error)
  }, [error])

  return (
    <div>
      <h2>Admin Dashboard Error</h2>
      <button onClick={() => reset()}>Try again</button>
      <button onClick={() => router.push('/')}>Return home</button>
    </div>
  )
} 