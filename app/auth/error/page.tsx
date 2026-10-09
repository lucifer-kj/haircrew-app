'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration. Please contact support.',
    AccessDenied: 'Access denied. You do not have permission to access this page.',
    Verification: 'The verification token has expired or is invalid.',
    Default: 'An unexpected authentication error occurred. Please try again.',
  }

  const message = (error && errorMessages[error]) || errorMessages.Default

  return (
    <Card className="max-w-md w-full border border-destructive/20 shadow-xl bg-card rounded-2xl overflow-hidden">
      <CardHeader className="text-center pb-4 pt-8 bg-gradient-to-b from-destructive/10 to-transparent">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-3 text-destructive shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Authentication Error
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm mt-1">
          We encountered an issue while processing your request
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 px-6 sm:px-8 text-center">
        <p className="text-sm text-foreground/80 bg-muted/60 p-4 rounded-xl border border-border/60">
          {message}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 px-6 sm:px-8 justify-center">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Home
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/auth/signin">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Signing In
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
