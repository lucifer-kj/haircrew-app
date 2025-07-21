"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Users, BarChart2 } from 'lucide-react'

const tabs = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/admin/products', icon: Package, label: 'Products' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Customers' },
  { href: '/dashboard/admin/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function AdminMobileTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16 md:hidden">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex flex-col items-center justify-center flex-1 py-2 ${pathname === tab.href ? 'text-primary' : 'text-gray-500'}`}
          aria-label={tab.label}
        >
          <tab.icon className="w-6 h-6 mb-1" />
          <span className="text-xs">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
} 