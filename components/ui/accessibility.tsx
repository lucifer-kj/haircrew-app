import React from 'react'

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 rounded z-50"
    >
      Skip to main content
    </a>
  )
}

// Focus trap for modals and dialogs
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return containerRef
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Accessible loading spinner
export function AccessibleLoadingSpinner({
  label = 'Loading...',
  size = 'md',
}: {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-primary rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

// Accessible error message
export function AccessibleErrorMessage({
  error,
  id,
}: {
  error?: string | null
  id: string
}) {
  if (!error) return null

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className="text-sm text-destructive mt-1"
    >
      {error}
    </div>
  )
}

// Accessible form field wrapper
export function AccessibleFormField({
  label,
  error,
  required = false,
  children,
  id,
  description,
}: {
  label: string
  error?: string | null
  required?: boolean
  children: React.ReactNode
  id: string
  description?: string
}) {
  const errorId = `${id}-error`
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {children}
      <AccessibleErrorMessage error={error} id={errorId} />
    </div>
  )
}
