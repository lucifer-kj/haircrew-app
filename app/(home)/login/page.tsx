'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AccessibleErrorMessage } from '@/components/ui/accessibility'
import { toast } from 'sonner'
import { z } from 'zod'
import { Suspense } from 'react'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const LoginSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
  })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  // Show session expiry message if present
  const reason = searchParams.get('reason')
  const redirectTo = searchParams.get('redirect')
  const sessionExpiredMsg = reason === 'expired' ? 'Your session has expired. Please sign in again.' : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    const result = LoginSchema.safeParse({ email, password })
    if (!result.success) {
      const errors: { email?: string; password?: string } = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as 'email' | 'password'] = err.message
      })
      setFieldErrors(errors)
      return
    }
    setLoading(true)
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    setLoading(false)
    if (res?.error) {
      setError(
        res.error === 'CredentialsSignin'
          ? 'Invalid email or password. Please try again.'
          : res.error
      )
      toast.error(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error)
    } else {
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        {sessionExpiredMsg && (
          <div className="text-orange-600 text-center mb-2">{sessionExpiredMsg}</div>
        )}
        {error && <AccessibleErrorMessage error={error} id="login-error" />}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <AccessibleErrorMessage error={fieldErrors.email} id="login-email-error" />}
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && <AccessibleErrorMessage error={fieldErrors.password} id="login-password-error" />}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <div className="text-center text-sm mt-2">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-[var(--primary)] underline">
            Sign up
          </a>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
