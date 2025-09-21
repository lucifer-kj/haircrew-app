import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Web Vitals reporting function
export function reportWebVitals(metric: {
  name: string
  value: number
  id: string
  delta: number
  entries: PerformanceEntry[]
}) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Send to custom analytics endpoint
    if (typeof window !== 'undefined' && 'navigator' in window) {
      const endpoint = '/api/analytics/web-vitals'
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      })

      // Use sendBeacon for better reliability
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(endpoint, body)
      } else {
        // Fallback to fetch
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {
          // Silently fail if analytics can't be sent
        })
      }
    }
  }
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
  if (typeof window === 'undefined') return

  // Get all Web Vitals metrics
  getCLS(reportWebVitals)
  getFID(reportWebVitals)
  getFCP(reportWebVitals)
  getLCP(reportWebVitals)
  getTTFB(reportWebVitals)

  // Additional performance monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          
          // Report navigation timing
          reportWebVitals({
            name: 'Navigation',
            value: navEntry.loadEventEnd - navEntry.loadEventStart,
            id: 'navigation',
            delta: navEntry.loadEventEnd - navEntry.loadEventStart,
            entries: [navEntry],
          })
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
  }
}

// Google Analytics 4 configuration
export function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

// Declare gtag function for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
