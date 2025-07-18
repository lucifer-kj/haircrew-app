import * as React from 'react'
const { useRef, useEffect, lazy } = React

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getMetrics(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const result: Record<
      string,
      { avg: number; min: number; max: number; count: number }
    > = {}

    for (const [name, values] of this.metrics.entries()) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)

      result[name] = { avg, min, max, count: values.length }
    }

    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}

// React hook for measuring component render time
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()

    return () => {
      const duration = performance.now() - startTime.current
      PerformanceMonitor.getInstance().recordMetric(
        `${componentName}_render`,
        duration
      )
    }
  })
}

// API performance monitoring
export async function withPerformanceMonitoring<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const stopTimer = PerformanceMonitor.getInstance().startTimer(name)
  try {
    const result = await fn()
    return result
  } finally {
    stopTimer()
  }
}

// Database query performance monitoring
export function monitorDatabaseQuery<T>(
  queryName: string,
  fn: () => Promise<T>
): Promise<T> {
  return withPerformanceMonitoring(`db_${queryName}`, fn)
}

// Component lazy loading with performance tracking
export function lazyWithPerformance<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) {
  return lazy(() =>
    withPerformanceMonitoring(`lazy_load_${componentName}`, importFn)
  )
}

// Web Vitals monitoring
export function reportWebVitals(metric: {
  name: string
  value: number
  id: string
}) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics
    // gtag('event', metric.name, {
    //   event_category: 'Web Vitals',
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    // });
  }
}

// Resource loading performance
export function monitorResourceLoading() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming
        PerformanceMonitor.getInstance().recordMetric(
          'page_load',
          navEntry.loadEventEnd - navEntry.loadEventStart
        )
        PerformanceMonitor.getInstance().recordMetric(
          'dom_content_loaded',
          navEntry.domContentLoadedEventEnd -
            navEntry.domContentLoadedEventStart
        )
      }
    }
  })

  observer.observe({ entryTypes: ['navigation'] })
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  setInterval(() => {
    const memory = (
      performance as Performance & {
        memory?: { usedJSHeapSize: number; totalJSHeapSize: number }
      }
    ).memory
    if (memory) {
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const totalMB = memory.totalJSHeapSize / 1024 / 1024

      PerformanceMonitor.getInstance().recordMetric('memory_used_mb', usedMB)
      PerformanceMonitor.getInstance().recordMetric('memory_total_mb', totalMB)

      // Warn if memory usage is high
      if (usedMB > 100) {
        console.warn(`High memory usage: ${usedMB.toFixed(2)}MB`)
      }
    }
  }, 30000) // Check every 30 seconds
}
