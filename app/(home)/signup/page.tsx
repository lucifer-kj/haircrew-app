'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AccessibleErrorMessage } from '@/components/ui/accessibility'
import { toast } from 'sonner'
import { z } from 'zod'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const SignupSchema = z.object({
    name: z.string().min(2, 'Name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirm: z.string(),
  }).refine(data => data.password === data.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  })
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})
    const result = SignupSchema.safeParse(form)
    if (!result.success) {
      const errors: { name?: string; email?: string; password?: string; confirm?: string } = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as keyof typeof errors] = err.message
      })
      setFieldErrors(errors)
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    })
    setLoading(false)
    const data = await res.json()
    if (res.ok) {
      setSuccess('Account created! Redirecting to login...')
      toast.success('Account created! Redirecting to login...')
      setTimeout(() => router.push('/login'), 1500)
    } else {
      setError(data.error || 'Failed to create account.')
      toast.error(data.error || 'Failed to create account.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        {error && <AccessibleErrorMessage error={error} id="signup-error" />}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
            aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && <AccessibleErrorMessage error={fieldErrors.name} id="signup-name-error" />}
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <AccessibleErrorMessage error={fieldErrors.email} id="signup-email-error" />}
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && <AccessibleErrorMessage error={fieldErrors.password} id="signup-password-error" />}
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <Input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            required
            aria-describedby={fieldErrors.confirm ? 'signup-confirm-error' : undefined}
            aria-invalid={!!fieldErrors.confirm}
          />
          {fieldErrors.confirm && <AccessibleErrorMessage error={fieldErrors.confirm} id="signup-confirm-error" />}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </Button>
        <div className="text-center text-sm mt-2">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--primary)] underline">
            Sign in
          </a>
        </div>
      </form>
    </div>
  )
}
