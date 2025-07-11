import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./profile-client"

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

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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
    <ProfileClient 
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
        memberSince
      }}
      stats={{
        ordersCount,
        addressesCount,
        wishlistCount
      }}
    />
  )
} 