import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'default' | 'lg'
  linkHref?: string
}

export function Logo({
  className,
  showText = true,
  size = 'default',
  linkHref = '/',
}: LogoProps) {
  const sizeMap = {
    sm: { img: 28, text: 'text-lg', sub: 'text-[9px]' },
    default: { img: 36, text: 'text-2xl', sub: 'text-[10px]' },
    lg: { img: 48, text: 'text-3xl', sub: 'text-xs' },
  }

  const currentSize = sizeMap[size]

  const content = (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      <div className="relative overflow-hidden rounded-xl bg-white shadow-xs border border-border/60 transition-transform group-hover:scale-105 duration-200">
        <Image
          src="/logo.png"
          alt="HairCrew Luxury Haircare"
          width={currentSize.img}
          height={currentSize.img}
          className="object-cover rounded-xl"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors',
              currentSize.text
            )}
          >
            Hair<span className="text-primary">Crew</span>
          </span>
          <span
            className={cn(
              'font-semibold uppercase tracking-widest text-muted-foreground mt-0.5',
              currentSize.sub
            )}
          >
            Professional
          </span>
        </div>
      )}
    </div>
  )

  if (linkHref) {
    return (
      <Link href={linkHref} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {content}
      </Link>
    )
  }

  return content
}

export default Logo
