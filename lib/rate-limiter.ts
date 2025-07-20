import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type Duration = `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`

export const createRateLimiter = (tokens: number, window: Duration) => {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(tokens, window), // 15 requests per 30 seconds
    analytics: true,
    prefix: 'ratelimit:dashboard',
  })
}

export const dashboardLimiters = {
  metrics: createRateLimiter(15, '30 s'), // More generous for metrics
  sensitive: createRateLimiter(5, '1 m'), // Stricter for sensitive operations
} 