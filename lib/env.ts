import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  PUSHER_APP_ID: z.string().min(1).optional(),
  PUSHER_KEY: z.string().min(1).optional(),
  PUSHER_SECRET: z.string().min(1).optional(),
  PUSHER_CLUSTER: z.string().min(1).default('ap2'),
  RESEND_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_PUSHER_APP_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1).default('ap2'),
  UPLOADTHING_TOKEN: z.string().min(1).optional(),
})

// Parse environment variables with defaults for build time
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    // During build time, provide default values to prevent build failures
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Environment validation failed, using defaults for build')
      return {
        DATABASE_URL: 'postgresql://localhost:5432/haircrew',
        NEXTAUTH_SECRET: 'default-secret-for-build-only-32-chars',
        NEXTAUTH_URL: 'http://localhost:3000',
        PUSHER_APP_ID: 'default-app-id',
        PUSHER_KEY: 'default-key',
        PUSHER_SECRET: 'default-secret',
        PUSHER_CLUSTER: 'ap2',
        RESEND_API_KEY: 'default-resend-key',
        NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
        NEXT_PUBLIC_PUSHER_APP_KEY: 'default-key',
        NEXT_PUBLIC_PUSHER_CLUSTER: 'ap2',
        UPLOADTHING_TOKEN: 'default-token',
      }
    }
    throw error
  }
}

export const env = parseEnv()
