'use client'

import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fadeSlidePageTransition } from '@/lib/motion.config'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { usePathname } from 'next/navigation'

export default function AnimatedLayoutClient({
  children,
}: {
  children: ReactNode
}) {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={reduced ? undefined : fadeSlidePageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
