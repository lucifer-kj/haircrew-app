'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('All fields are required.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
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
      setTimeout(() => router.push('/login'), 1500)
    } else {
      setError(data.error || 'Failed to create account.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <Input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            required
          />
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
