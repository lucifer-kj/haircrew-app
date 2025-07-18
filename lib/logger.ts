interface LogContext {
  userId?: string
  action?: string
  resource?: string
  ip?: string
  userAgent?: string
  timestamp?: string
}

interface LogData {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: LogContext
  data?: unknown
  error?: Error
}

class Logger {
  private static formatLog(logData: LogData): string {
    const timestamp = logData.context?.timestamp || new Date().toISOString()
    const context = logData.context
      ? `[${logData.context.userId || 'anonymous'}:${logData.context.action || 'unknown'}]`
      : ''
    return `[${timestamp}] ${logData.level.toUpperCase()} ${context}: ${logData.message}`
  }

  private static shouldLog(level: string): boolean {
    if (level === 'error') return true // Always log errors
    if (process.env.NODE_ENV === 'production') {
      return level === 'info' || level === 'warn' // Only info and warn in production
    }
    return true // Log everything in development
  }

  static info(message: string, context?: LogContext, data?: unknown) {
    if (!this.shouldLog('info')) return

    const logData: LogData = {
      level: 'info',
      message,
      context: { ...context, timestamp: new Date().toISOString() },
      data,
    }

    console.log(this.formatLog(logData))
    if (data) console.log('Data:', data)
  }

  static error(
    message: string,
    error?: Error,
    context?: LogContext,
    data?: unknown
  ) {
    const logData: LogData = {
      level: 'error',
      message,
      context: { ...context, timestamp: new Date().toISOString() },
      error,
      data,
    }

    console.error(this.formatLog(logData))
    if (error) console.error('Error stack:', error.stack)
    if (data) console.error('Error data:', data)
  }

  static warn(message: string, context?: LogContext, data?: unknown) {
    if (!this.shouldLog('warn')) return

    const logData: LogData = {
      level: 'warn',
      message,
      context: { ...context, timestamp: new Date().toISOString() },
      data,
    }

    console.warn(this.formatLog(logData))
    if (data) console.warn('Data:', data)
  }

  static debug(message: string, context?: LogContext, data?: unknown) {
    if (!this.shouldLog('debug')) return

    const logData: LogData = {
      level: 'debug',
      message,
      context: { ...context, timestamp: new Date().toISOString() },
      data,
    }

    console.debug(this.formatLog(logData))
    if (data) console.debug('Data:', data)
  }

  // Specialized logging methods
  static auth(
    action: string,
    success: boolean,
    userId?: string,
    context?: Omit<LogContext, 'action' | 'userId'>
  ) {
    const message = `Authentication ${action} ${success ? 'successful' : 'failed'}`
    this.info(message, { ...context, action, userId })
  }

  static order(
    action: string,
    orderId: string,
    userId: string,
    context?: Omit<LogContext, 'action' | 'userId'>
  ) {
    const message = `Order ${action}: ${orderId}`
    this.info(message, { ...context, action, userId, resource: orderId })
  }

  static product(
    action: string,
    productId: string,
    userId?: string,
    context?: Omit<LogContext, 'action' | 'userId'>
  ) {
    const message = `Product ${action}: ${productId}`
    this.info(message, { ...context, action, userId, resource: productId })
  }

  static validation(
    field: string,
    value: unknown,
    userId?: string,
    context?: Omit<LogContext, 'action' | 'userId'>
  ) {
    const message = `Validation failed for field: ${field}`
    this.warn(
      message,
      { ...context, action: 'validation', userId },
      { field, value }
    )
  }

  static security(
    event: string,
    userId?: string,
    ip?: string,
    context?: Omit<LogContext, 'action' | 'userId'>
  ) {
    const message = `Security event: ${event}`
    this.warn(message, { ...context, action: 'security', userId, ip })
  }

  // Backward compatibility
  static withContext(context: string): typeof Logger {
    return new Proxy(Logger, {
      get(target, prop: keyof typeof Logger) {
        if (typeof target[prop] === 'function') {
          return (...args: unknown[]) => {
            ;(target[prop] as (...args: unknown[]) => void)(
              `[${context}]`,
              ...args
            )
          }
        }
        return target[prop]
      },
    })
  }
}

export default Logger
