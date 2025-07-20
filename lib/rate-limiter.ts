import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type Duration = `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`

export const createRateLimiter = (tokens: number, window: Duration) => {
  // Check if Redis environment variables are available
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Upstash Redis not configured. Rate limiting disabled.');
    // Return a mock rate limiter that always allows requests
    return {
      limit: async (): Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
        pending: Promise<void>;
      }> => ({
        success: true,
        limit: tokens,
        remaining: tokens - 1,
        reset: Date.now() + 30000,
        pending: Promise.resolve()
      }),
      getRemaining: async (): Promise<{
        remaining: number;
        reset: number;
      }> => ({
        remaining: tokens,
        reset: Date.now() + 30000
      }),
      resetTokens: async (): Promise<void> => {}
    };
  }

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