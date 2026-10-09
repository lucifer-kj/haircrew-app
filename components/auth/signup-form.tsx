'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { Sparkles, Lock, Mail, User, ArrowRight } from 'lucide-react'

const SignupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirm: z.string(),
  })
  .refine(data => data.password === data.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  })

export default function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirm?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const validation = SignupSchema.safeParse(form)
    if (!validation.success) {
      const errs: Record<string, string> = {}
      validation.error.errors.forEach(err => {
        if (err.path[0]) errs[err.path[0] as string] = err.message
      })
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setLoading(false)
        setError(data.error || 'Failed to create account.')
        toast.error(data.error || 'Registration failed.')
        return
      }

      toast.success('Account created! Signing you in...')
      // Automatically log in the user
      const loginRes = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      })

      setLoading(false)
      if (loginRes?.ok) {
        router.push('/')
        router.refresh()
      } else {
        router.push('/auth/signin')
      }
    } catch {
      setLoading(false)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden backdrop-blur-md">
        <CardHeader className="text-center pb-4 pt-8 bg-gradient-to-b from-secondary/50 to-transparent">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-xs">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            Join HairCrew for exclusive hair care routines & fast ordering
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 px-6 sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-foreground text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-9 h-11 bg-background/50 border-input focus-visible:ring-primary"
                  required
                  autoFocus
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-9 h-11 bg-background/50 border-input focus-visible:ring-primary"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-9 h-11 bg-background/50 border-input focus-visible:ring-primary"
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-foreground text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={handleChange}
                  className="pl-9 h-11 bg-background/50 border-input focus-visible:ring-primary"
                  required
                />
              </div>
              {fieldErrors.confirm && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-md group mt-2"
              disabled={loading}
            >
              {loading ? (
                'Creating account...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-6 pt-2 justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary font-semibold hover:underline ml-1">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
