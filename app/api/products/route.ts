export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const priceRange = searchParams.get('priceRange');
    const stockStatus = searchParams.get('stockStatus');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '9', 10);
    
    const where: {
      isActive: boolean;
      categoryId?: string;
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }>;
      price?: { gte?: number; lte?: number };
      stock?: { gt?: number; lte?: number };
    } = { isActive: true };
    
    // Category filter
    if (category) where.categoryId = category;
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Price range filter
    if (priceRange && priceRange !== 'all') {
      switch (priceRange) {
        case '0-500':
          where.price = { gte: 0, lte: 500 };
          break;
        case '500-1000':
          where.price = { gte: 500, lte: 1000 };
          break;
        case '1000-2000':
          where.price = { gte: 1000, lte: 2000 };
          break;
        case '2000+':
          where.price = { gte: 2000 };
          break;
      }
    }
    
    // Stock status filter
    if (stockStatus && stockStatus !== 'all') {
      switch (stockStatus) {
        case 'in-stock':
          where.stock = { gt: 10 };
          break;
        case 'low-stock':
          where.stock = { gt: 0, lte: 10 };
          break;
        case 'out-of-stock':
          where.stock = { lte: 0 };
          break;
      }
    }
    
    // Sorting
    let orderBy: { createdAt?: 'asc' | 'desc'; price?: 'asc' | 'desc'; name?: 'asc' | 'desc' } = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      default: // newest
        orderBy = { createdAt: 'desc' };
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          slug: true,
          categoryId: true,
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    return NextResponse.json({ products, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 