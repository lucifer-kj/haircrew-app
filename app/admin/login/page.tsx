import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AdminLoginForm } from '@/components/auth/admin-login-form'

export const metadata: Metadata = {
  title: 'Admin Portal Login | HairCrew',
  description: 'Sign in to access the HairCrew store administration console.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-[460px] rounded-2xl border border-border/80 bg-card/60 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  )
}
