interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<void>
}

class MemoryRateLimiter {
  private tokens: number
  private windowMs: number
  private hits: Map<string, number[]> = new Map()

  constructor(tokens: number, windowMs: number) {
    this.tokens = tokens
    this.windowMs = windowMs
  }

  async limit(identifier = 'global'): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const timestamps = (this.hits.get(identifier) || []).filter(t => t > windowStart)

    if (timestamps.length >= this.tokens) {
      return {
        success: false,
        limit: this.tokens,
        remaining: 0,
        reset: timestamps[0] + this.windowMs,
        pending: Promise.resolve(),
      }
    }

    timestamps.push(now)
    this.hits.set(identifier, timestamps)

    return {
      success: true,
      limit: this.tokens,
      remaining: this.tokens - timestamps.length,
      reset: now + this.windowMs,
      pending: Promise.resolve(),
    }
  }

  async getRemaining(identifier = 'global') {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const timestamps = (this.hits.get(identifier) || []).filter(t => t > windowStart)
    return {
      remaining: Math.max(0, this.tokens - timestamps.length),
      reset: now + this.windowMs,
    }
  }

  async resetTokens(identifier = 'global') {
    this.hits.delete(identifier)
  }
}

export const createRateLimiter = (tokens: number, windowStr: string) => {
  let ms = 30000
  const match = windowStr.match(/^(\d+)\s*(ms|s|m|h)?$/)
  if (match) {
    const num = parseInt(match[1])
    const unit = match[2] || 's'
    if (unit === 's') ms = num * 1000
    else if (unit === 'm') ms = num * 60 * 1000
    else if (unit === 'h') ms = num * 3600 * 1000
    else ms = num
  }
  return new MemoryRateLimiter(tokens, ms)
}

export const dashboardLimiters = {
  metrics: createRateLimiter(30, '30s'),
  sensitive: createRateLimiter(10, '60s'),
}