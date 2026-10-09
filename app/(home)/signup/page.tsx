import React, { Suspense } from 'react'
import SignupForm from '@/components/auth/signup-form'

export const metadata = {
  title: 'Sign Up - HairCrew Professional',
  description: 'Create an account on HairCrew to experience salon-quality hair care products.',
}

export default function HomeSignUpPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading sign-up...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
