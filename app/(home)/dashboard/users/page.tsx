import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UsersClientWrapper from './users-client-wrapper';

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/');
  }
  return <UsersClientWrapper />;
} 