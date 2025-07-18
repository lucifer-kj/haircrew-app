'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

interface Toast {
  id: number
  message: string
  type?: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type?: Toast['type']) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-6 py-3 rounded-xl shadow-lg text-white font-semibold text-base animate-fade-in-down
            ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-secondary'}
          `}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
