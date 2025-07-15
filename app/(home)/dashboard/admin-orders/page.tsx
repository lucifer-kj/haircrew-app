import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminOrdersClient from './admin-orders-client';

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/');
  }
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          product: { select: { name: true, images: true, slug: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  // Serialize for client
  const serializedOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    total: order.total.toString(),
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      productId: item.productId,
      orderId: item.orderId,
      quantity: item.quantity,
      price: item.price.toString(),
      createdAt: item.createdAt.toISOString(),
      product: item.product ? {
        name: item.product.name,
        images: item.product.images,
        slug: item.product.slug
      } : undefined
    })),
    user: {
      name: order.user.name || '',
      email: order.user.email || ''
    }
  }));
  return <AdminOrdersClient orders={serializedOrders} />;
}