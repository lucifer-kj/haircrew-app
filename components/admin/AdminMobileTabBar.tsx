"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Users, MoreHorizontal } from 'lucide-react'

export function AdminMobileTabBar({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const tabs = [
    { href: '/dashboard/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/dashboard/admin/products', icon: Package, label: 'Products' },
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview', center: true },
    { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
    { href: '#', icon: MoreHorizontal, label: 'More', onClick: onMore },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16 md:hidden">
      {tabs.map((tab) =>
        tab.onClick ? (
          <button
            key={tab.label}
            onClick={tab.onClick}
            className={`flex flex-col items-center justify-center flex-1 py-2 ${tab.center ? 'scale-110' : ''}`}
            aria-label={tab.label}
            style={tab.center ? { zIndex: 1 } : {}}
          >
            <tab.icon className="w-7 h-7 mb-1" />
            <span className="text-xs">{tab.label}</span>
          </button>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 py-2 ${pathname === tab.href ? 'text-primary' : 'text-gray-500'} ${tab.center ? 'scale-110' : ''}`}
            aria-label={tab.label}
            style={tab.center ? { zIndex: 1 } : {}}
          >
            <tab.icon className="w-7 h-7 mb-1" />
            <span className="text-xs">{tab.label}</span>
          </Link>
        )
      )}
    </nav>
  );
} 