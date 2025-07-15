"use client";
import React, { useState } from 'react';
import ProductForm from './product-form';

const mockProducts = [
  { id: '1', name: 'Shampoo', price: 299, stock: 20, isActive: true },
  { id: '2', name: 'Conditioner', price: 349, stock: 8, isActive: false },
];

export default function AdminProductsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          className="px-4 py-2 rounded bg-primary text-white font-semibold shadow hover:bg-primary/80 transition"
          onClick={() => setShowForm(true)}
        >
          + New Product
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-slate-800/80">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900/40">
              <th className="p-2"><input type="checkbox" disabled /></th>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map(product => (
              <tr key={product.id} className="border-b hover:bg-primary/5 transition">
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                  />
                </td>
                <td className="p-2 whitespace-nowrap">{product.name}</td>
                <td className="p-2 whitespace-nowrap">₹{product.price}</td>
                <td className="p-2 whitespace-nowrap">{product.stock}</td>
                <td className="p-2 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="p-2 whitespace-nowrap flex gap-2">
                  <button className="px-2 py-1 rounded bg-primary text-white text-xs" title="Edit">Edit</button>
                  <button className="px-2 py-1 rounded bg-red-500 text-white text-xs" title="Delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Product Form Modal (stub) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">New Product</h2>
            <ProductForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 