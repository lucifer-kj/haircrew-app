import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./profile-client"
import { Suspense } from "react"

// Simple loading component for server-side rendering
function ProfileLoading() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-5xl">
        <div className="animate-pulse">
          <div className="h-40 bg-slate-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="h-32 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const memberSince = user.createdAt.toISOString()

  // Get counts for the profile summary
  const [ordersCount, addressesCount, wishlistCount] = await Promise.all([
    prisma.order.count({
      where: { userId: user.id }
    }),
    prisma.address.count({
      where: { userId: user.id }
    }),
    prisma.wishlist.count({
      where: { userId: user.id }
    })
  ])

  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileClient 
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          memberSince
        }}
        stats={{
          ordersCount,
          addressesCount,
          wishlistCount
        }}
      />
    </Suspense>
  )
} 