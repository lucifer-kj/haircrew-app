'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Menu,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Star,
} from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import { AdminMobileTabBar } from '@/components/admin/AdminMobileTabBar'
import { AdminNotificationProvider } from '@/components/admin/AdminNotificationProvider'
import AdminNotificationsPanel from '@/components/admin/AdminNotificationsPanel'

const navItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/dashboard/admin/products', icon: Package },
  { label: 'Customers', href: '/dashboard/admin/users', icon: Users },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  // New admin sections
  { label: 'Complaints', href: '/dashboard/admin/complaints', icon: MessageCircle },
  { label: 'Newsletter Signups', href: '/dashboard/admin/newsletter', icon: Mail },
  { label: 'Reviews', href: '/dashboard/admin/reviews', icon: Star },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AuthGuard>
      <AdminNotificationProvider>
        <div className="min-h-screen flex bg-gradient-to-br from-primary/10 to-secondary/10">
          {/* Desktop sidebar toggle and sidebar only */}
          <button
            className="fixed top-4 left-4 z-30 hidden md:block p-2 rounded-md bg-white/80 shadow-lg backdrop-blur-md"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6 text-primary" />
          </button>

          {/* Sidebar (desktop only) */}
          <aside
            className={`sticky top-20 h-[calc(100vh-80px)] w-64 overflow-y-auto z-40 bg-white dark:bg-slate-900/95 shadow-lg border-r border-slate-200 dark:border-slate-800 hidden md:block ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
          >
            <div className={`flex items-center border-b border-slate-100 dark:border-slate-800 ${sidebarCollapsed ? 'justify-center px-2 py-4' : 'justify-between px-6 py-4'}`}>
              {!sidebarCollapsed && (
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Admin
                </span>
              )}
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
                <button
                  className="hidden md:flex p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>
            <nav className={`mt-6 flex flex-col gap-1 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-primary/10 dark:hover:bg-primary/20 font-medium transition
                  ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-2'}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  {!sidebarCollapsed && label}
                </Link>
              ))}
            </nav>
          </aside>
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* Main content */}
          <main className="flex-1 p-4 pb-20 md:pb-4 transition-all duration-200">
            <div className="max-w-7xl mx-auto px-4">
              {children}
            </div>
          </main>
          <AdminNotificationsPanel />
        </div>
        <AdminMobileTabBar onMore={() => {}} />
      </AdminNotificationProvider>
    </AuthGuard>
  )
}