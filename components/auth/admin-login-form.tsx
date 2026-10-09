'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/admin'
  const initialError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(
    initialError === 'AccessDenied'
      ? 'Access Denied: Administrator privileges are required to access this area.'
      : ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      })

      if (res?.error) {
        setError('Invalid administrative credentials. Please verify your email and password.')
        setIsLoading(false)
        return
      }

      // Fetch the updated session to verify admin role
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()

      if (!sessionData?.user || sessionData.user.role !== 'ADMIN') {
        // If a regular user attempted to log into the admin portal, immediately sign out
        await signOut({ redirect: false })
        setError('Access Denied: This account does not possess administrator privileges.')
        setIsLoading(false)
        return
      }

      // Valid admin
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('An unexpected error occurred during authentication. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border border-border/80 shadow-2xl bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 w-full" />
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            Sign in with authorized administrative credentials to manage HairCrew.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-in fade-in-50">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administrator Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@haircrew.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-border focus-visible:ring-primary rounded-xl"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background/50 border-border focus-visible:ring-primary rounded-xl"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-6 py-6 border-t border-border/40 bg-muted/20 flex flex-col gap-3 text-center">
          <p className="text-xs text-muted-foreground">
            This system is restricted to authorized personnel only. All access attempts are recorded.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to HairCrew Store
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
