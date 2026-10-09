'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setLoading(false)

      if (res.ok) {
        setSuccess('If your email is registered, a password reset link has been sent.')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send reset email.')
      }
    } catch {
      setLoading(false)
      setError('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md mx-auto">
        <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden backdrop-blur-md">
          <CardHeader className="text-center pb-4 pt-8 bg-gradient-to-b from-secondary/50 to-transparent">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-xs">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Enter your email address and we&apos;ll send you a recovery link
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 px-6 sm:px-8">
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium text-center">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-background/50 border-input focus-visible:ring-primary"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md mt-2"
                disabled={loading}
              >
                {loading ? 'Sending link...' : 'Send Recovery Link'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pb-6 pt-2 justify-center text-sm text-muted-foreground">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
