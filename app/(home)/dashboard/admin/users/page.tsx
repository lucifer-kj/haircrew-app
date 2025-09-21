import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import UsersClientWrapper from './users-client-wrapper'
import type { Session } from 'next-auth'

export default async function UsersPage() {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }
  return <UsersClientWrapper />
}
