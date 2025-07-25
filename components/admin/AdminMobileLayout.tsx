'use client';
import { useState } from 'react';
import { AdminMobileTabBar } from './AdminMobileTabBar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BarChart2, Mail, MessageCircle, Star, Settings } from 'lucide-react';

export default function AdminMobileLayout({ children }: { children: React.ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <main className="flex-1 px-2 py-2">{children}</main>
      <AdminMobileTabBar onMore={() => setMoreOpen(true)} />
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent>
          <div className="flex flex-col gap-4 mt-4">
            <a href="/dashboard/admin/analytics" className="flex items-center gap-2 py-3 text-lg"><BarChart2 /> Analytics</a>
            <a href="/dashboard/admin/newsletter" className="flex items-center gap-2 py-3 text-lg"><Mail /> Newsletter</a>
            <a href="/dashboard/admin/complaints" className="flex items-center gap-2 py-3 text-lg"><MessageCircle /> Complaints</a>
            <a href="/dashboard/admin/reviews" className="flex items-center gap-2 py-3 text-lg"><Star /> Reviews</a>
            <a href="/dashboard/admin/settings" className="flex items-center gap-2 py-3 text-lg"><Settings /> Settings</a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 