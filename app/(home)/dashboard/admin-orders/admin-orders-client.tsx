"use client";
import React, { useEffect, useState } from "react";
import { useSocket } from '@/components/providers/socket-provider';

interface OrderItem {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: string;
  createdAt: string;
  product?: {
    name: string;
    images: string[];
    slug: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  orderItems: OrderItem[];
}

interface AdminOrdersClientProps {
  orders: Order[];
}

export default function AdminOrdersClient({ orders: initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const { socket } = useSocket();

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleUserPaid = (data: { orderId: string }) => {
      // Refetch or optimistically update order status
      setOrders((prev) => prev.map(o => o.id === data.orderId ? { ...o, status: 'PROCESSING' } : o));
    };
    const handleOrderConfirmed = (data: { orderId: string }) => {
      setOrders((prev) => prev.map(o => o.id === data.orderId ? { ...o, status: 'CONFIRMED' } : o));
    };
    socket.on('userPaid', handleUserPaid);
    socket.on('orderConfirmed', handleOrderConfirmed);
    return () => {
      socket.off('userPaid', handleUserPaid);
      socket.off('orderConfirmed', handleOrderConfirmed);
    };
  }, [socket]);

  // Admin actions
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await fetch('/api/order/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, newStatus }),
      credentials: 'include',
    });
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>
      <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-slate-800/80">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900/40">
              <th className="p-2">Order #</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-primary/5 transition">
                <td className="p-2 whitespace-nowrap font-mono">{order.orderNumber}</td>
                <td className="p-2 whitespace-nowrap">{order.user?.name || order.user?.email}</td>
                <td className="p-2 whitespace-nowrap font-semibold">₹{order.total}</td>
                <td className="p-2 whitespace-nowrap">{order.status}</td>
                <td className="p-2 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-2 whitespace-nowrap flex gap-2">
                  {order.status === 'PROCESSING' && (
                    <button className="px-2 py-1 rounded bg-green-600 text-white text-xs" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}>Confirm</button>
                  )}
                  {order.status !== 'REFUNDED' && (
                    <button className="px-2 py-1 rounded bg-blue-500 text-white text-xs" onClick={() => updateOrderStatus(order.id, 'REFUNDED')}>Refund</button>
                  )}
                  <button className="px-2 py-1 rounded bg-slate-500 text-white text-xs" onClick={() => window.open(`/order-received/${order.id}`, '_blank')}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 