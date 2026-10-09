'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { z } from 'zod'
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const reason = searchParams.get('reason')
  const redirectTo = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/'
  const sessionExpiredMsg = reason === 'expired' ? 'Your session has expired. Please sign in again.' : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const validation = LoginSchema.safeParse({ email, password })
    if (!validation.success) {
      const errs: { email?: string; password?: string } = {}
      validation.error.errors.forEach(err => {
        if (err.path[0]) errs[err.path[0] as 'email' | 'password'] = err.message
      })
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      setLoading(false)

      if (res?.error) {
        const errorMsg =
          res.error === 'CredentialsSignin'
            ? 'Invalid email or password. Please try again.'
            : res.error
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        toast.success('Signed in successfully!')
        try {
          const sessionRes = await fetch('/api/auth/session')
          const sessionData = await sessionRes.json()
          if (sessionData?.user?.role === 'ADMIN' && (redirectTo === '/' || !redirectTo)) {
            router.push('/dashboard/admin')
          } else {
            router.push(redirectTo)
          }
        } catch {
          router.push(redirectTo)
        }
        router.refresh()
      }
    } catch {
      setLoading(false)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const fillAdminCredentials = () => {
    setEmail('admin@haircrew.com')
    setPassword('admin123')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden backdrop-blur-md">
        <CardHeader className="text-center pb-4 pt-8 bg-gradient-to-b from-secondary/50 to-transparent">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-xs">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to HairCrew
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            Sign in to access your orders, profile, and dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 px-6 sm:px-8">
          {sessionExpiredMsg && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
              {sessionExpiredMsg}
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
              {fieldErrors.email && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11 bg-background/50 border-input focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-md group mt-2"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Development Quick Fill */}
          <div className="mt-6 pt-4 border-t border-border/60 text-center">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-full bg-secondary/60 hover:bg-secondary"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Fill Admin Demo Credentials</span>
            </button>
          </div>
        </CardContent>

        <CardFooter className="pb-6 pt-2 justify-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline ml-1">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
