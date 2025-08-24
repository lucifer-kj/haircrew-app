"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Users, MoreHorizontal } from 'lucide-react'

export function AdminMobileTabBar({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  // Only show up to 5 icons, move extras to More menu
  const allTabs = [
    { href: '/dashboard/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/dashboard/admin/products', icon: Package, label: 'Products' },
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview', center: true },
    { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
    // Add more tabs here if needed
  ];
  const MAX_ICONS = 5;
  const visibleTabs = allTabs.slice(0, MAX_ICONS - 1);
  const hasMore = allTabs.length > MAX_ICONS - 1;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16 md:hidden">
      {visibleTabs.map((tab) => (
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
      ))}
      {hasMore && (
        <button
          key="more"
          onClick={onMore}
          className="flex flex-col items-center justify-center flex-1 py-2"
          aria-label="More"
        >
          <MoreHorizontal className="w-7 h-7 mb-1" />
          <span className="text-xs">More</span>
        </button>
      )}
    </nav>
  );
} 