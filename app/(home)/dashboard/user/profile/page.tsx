import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProfileClient from './profile-client'
import { headers } from 'next/headers'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/dashboard/user/profile'

  if (!session?.user?.email) {
    redirect(`/auth/signin?reason=expired&redirect=${encodeURIComponent(pathname)}`)
  }

  // If admin, redirect to admin dashboard
  if (session.user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Get counts for the profile summary
  const [ordersCount, addressesCount, wishlistCount] = await Promise.all([
    prisma.order.count({
      where: { userId: user.id },
    }),
    prisma.address.count({
      where: { userId: user.id },
    }),
    prisma.wishlist.count({
      where: { userId: user.id },
    }),
  ])

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        image: user.image || '',
        createdAt: user.createdAt,
      }}
      stats={{
        ordersCount,
        addressesCount,
        wishlistCount,
      }}
    />
  )
}
