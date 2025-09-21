// types/auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

// Define your custom user roles as a union type
export type UserRole = 'USER' | 'ADMIN'

// Extend the built-in NextAuth types
declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string
    role: UserRole
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email: string
      role: UserRole
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: UserRole
  }
}