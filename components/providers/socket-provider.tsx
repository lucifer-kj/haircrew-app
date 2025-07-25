'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import Pusher from 'pusher-js'

// Pusher context type
interface PusherContextType {
  pusher: Pusher | null
}

const PusherContext = createContext<PusherContextType>({ pusher: null })

export const usePusher = () => useContext(PusherContext)

export const PusherProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pusher, setPusher] = useState<Pusher | null>(null)
  const pusherRef = useRef<Pusher | null>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || ''
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2'
    if (!key) return
    const p = new Pusher(key, {
      cluster,
      forceTLS: true,
    })
    pusherRef.current = p
    setPusher(p)
    return () => {
      p.disconnect()
      pusherRef.current = null
    }
  }, [])

  return (
    <PusherContext.Provider value={{ pusher }}>
      {children}
    </PusherContext.Provider>
  )
}
