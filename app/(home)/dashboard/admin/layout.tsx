'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import AuthGuard from '@/components/admin/AuthGuard'
import { AdminMobileTabBar } from '@/components/admin/AdminMobileTabBar'
import { AdminNotificationProvider } from '@/components/admin/AdminNotificationProvider'
import AdminNotificationsPanel from '@/components/admin/AdminNotificationsPanel'
import { Logo } from '@/components/ui/logo'

const navItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/dashboard/admin/products', icon: Package },
  { label: 'Customers', href: '/dashboard/admin/users', icon: Users },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  { label: 'Complaints', href: '/dashboard/admin/complaints', icon: MessageCircle },
  { label: 'Newsletter Signups', href: '/dashboard/admin/newsletter', icon: Mail },
  { label: 'Reviews', href: '/dashboard/admin/reviews', icon: Star },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <AuthGuard>
      <AdminNotificationProvider>
        <div className="min-h-screen flex bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          {/* Desktop Sidebar */}
          <aside
            className={`sticky top-0 h-screen overflow-y-auto z-40 bg-white dark:bg-slate-900 shadow-sm border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between hidden md:flex ${
              sidebarCollapsed ? 'w-20' : 'w-64'
            }`}
          >
            <div>
              {/* Header / Brand */}
              <div
                className={`flex items-center border-b border-slate-100 dark:border-slate-800 h-20 ${
                  sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'
                }`}
              >
                {!sidebarCollapsed ? (
                  <div className="flex items-center gap-2.5">
                    <Logo size="sm" />
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Admin
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    HC
                  </div>
                )}
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Navigation links */}
              <nav className={`mt-4 flex flex-col gap-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                {navItems.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center rounded-xl font-medium text-sm transition-all ${
                        sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
                      } ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? label : undefined}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      {!sidebarCollapsed && <span>{label}</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Sidebar Bottom Actions */}
            <div className={`p-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 ${sidebarCollapsed ? 'items-center' : ''}`}>
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between px-2 py-1.5 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {session?.user?.name || 'Admin'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {session?.user?.email || 'admin@haircrew.com'}
                      </p>
                    </div>
                  </div>
                  <AdminNotificationsPanel />
                </div>
              )}
              <Link
                href="/"
                target="_blank"
                className={`flex items-center rounded-xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                  sidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 gap-2.5'
                }`}
                title="View Storefront"
              >
                <ExternalLink className="h-4 w-4 text-slate-500" />
                {!sidebarCollapsed && <span>View Storefront</span>}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className={`flex items-center rounded-xl font-medium text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition ${
                  sidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 gap-2.5'
                }`}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                {!sidebarCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* Mobile slide-out drawer */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="w-64 h-full bg-white dark:bg-slate-900 p-4 shadow-xl flex flex-col justify-between"
                onClick={e => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Logo size="sm" />
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Admin
                      </span>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navItems.map(({ label, href, icon: Icon }) => {
                      const isActive = pathname === href
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{label}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Store</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* Main Content Area - Full canvas without any top header bar */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {/* Mobile Menu Toggle Button */}
              <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <button
                  className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Workspace</span>
                  <AdminNotificationsPanel />
                </div>
              </div>

              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>

          <AdminMobileTabBar onMore={() => setSidebarOpen(true)} />
        </div>
      </AdminNotificationProvider>
    </AuthGuard>
  )
}