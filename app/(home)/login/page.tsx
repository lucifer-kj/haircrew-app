"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })
    setLoading(false)
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
        <div className="text-center text-sm mt-2">
          Don&apos;t have an account? <a href="/signup" className="text-[var(--primary)] underline">Sign up</a>
        </div>
      </form>
    </div>
  )
} 