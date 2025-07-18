'use client'
import dynamic from 'next/dynamic'
import React from 'react'

const UsersClient = dynamic(() => import('./users-client'), { ssr: false })

export default function UsersClientWrapper() {
  return <UsersClient />
}
