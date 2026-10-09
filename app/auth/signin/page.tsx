import React, { Suspense } from 'react'
import LoginForm from '@/components/auth/login-form'

export const metadata = {
  title: 'Sign In - HairCrew Professional',
  description: 'Sign in to your HairCrew account to manage orders and explore luxury hair care.',
}

export default function SignInPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
