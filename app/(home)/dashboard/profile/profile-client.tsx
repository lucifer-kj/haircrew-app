"use client"

import { User, Mail, Calendar, Edit } from "lucide-react"
import { GlassCard, GlassButton, GlassPanel } from "@/components/ui/glass-card"
import Image from "next/image"
import { signOut } from "next-auth/react";

interface ProfileClientProps {
  user: {
    id: string
    name: string
    email: string
    image: string
    memberSince: string
  }
  stats: {
    ordersCount: number
    addressesCount: number
    wishlistCount: number
  }
}

export default function ProfileClient({ user, stats }: ProfileClientProps) {
  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        background: "linear-gradient(135deg, rgba(248,247,255,1) 0%, rgba(250,247,254,1) 35%, rgba(245,251,255,1) 100%)",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Profile Header */}
        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg border border-white/20">
                {user.image ? (
                  <Image 
                    src={user.image} 
                    alt={user.name || "User"} 
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary/60" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4 text-primary" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {user.name || "User"}
              </h1>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{user.email}</span>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-700">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Member since {user.memberSince}</span>
                </div>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <div className="md:self-start">
              <GlassButton 
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white"
              >
                Edit Profile
              </GlassButton>
            </div>
          </div>
        </GlassCard>
        
        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.ordersCount}</p>
              <p className="text-sm text-slate-600">Orders</p>
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-rose-500/10 mb-3">
                <Calendar className="h-6 w-6 text-rose-500" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.wishlistCount}</p>
              <p className="text-sm text-slate-600">Wishlist Items</p>
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-emerald-500/10 mb-3">
                <Mail className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.addressesCount}</p>
              <p className="text-sm text-slate-600">Saved Addresses</p>
            </div>
          </GlassCard>
        </div>
        
        {/* Account Security */}
        <GlassPanel>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Account Security</h2>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/20">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-slate-500">Last changed: Never</p>
                </div>
                <GlassButton>Change Password</GlassButton>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/20">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">Not enabled</p>
                </div>
                <GlassButton>Enable 2FA</GlassButton>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium">Account Deletion</p>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
                <GlassButton className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
                  Delete Account
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
      {/* Logout Button */}
      <div className="container mx-auto max-w-5xl mt-8 flex justify-center">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-6 py-3 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition-colors w-full max-w-xs"
        >
          Logout
        </button>
      </div>
    </div>
  )
} 