import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { getPusherServer } from '../lib/pusher-server';

async function testAdminWorkflows() {
  console.log('========================================================');
  console.log('🧪 STARTING COMPREHENSIVE ADMIN WORKFLOW VERIFICATION');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Verify Admin User & Password Authentication
  await test('Admin User Exists & Credentials Match', async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@haircrew.com' },
    });
    if (!admin) throw new Error('Admin user admin@haircrew.com not found in database');
    if (admin.role !== 'ADMIN') throw new Error(`Expected role ADMIN but got ${admin.role}`);
    const valid = await bcrypt.compare('admin123', admin.password || '');
    if (!valid) throw new Error('Password hash does not match admin123');
  });

  // 2. Test Admin Dashboard Query Data
  await test('Admin Dashboard Statistics & Metrics Query', async () => {
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
    ]);
    console.log(`   📊 Store Data: ${totalProducts} products, ${totalOrders} orders, ${totalUsers} users`);
    if (totalProducts === 0) throw new Error('No products found in database');
  });

  // 3. Test Product Management (List & Create & Delete temporary product)
  let testProductId = '';
  await test('Admin Product Management (Create, Fetch, Delete)', async () => {
    // Fetch categories
    const category = await prisma.category.findFirst();
    if (!category) throw new Error('No categories found for product creation');

    // Create test product
    const testSlug = `test-product-${Date.now()}`;
    const newProduct = await prisma.product.create({
      data: {
        name: 'Test Workflow Product',
        slug: testSlug,
        sku: `TEST-${Date.now()}`,
        description: 'Temporary product created for workflow verification',
        price: 999,
        stock: 50,
        images: ['/logo.png'],
        categoryId: category.id,
      },
    });
    testProductId = newProduct.id;

    // Verify product exists
    const fetched = await prisma.product.findUnique({ where: { id: testProductId } });
    if (!fetched) throw new Error('Failed to retrieve newly created product');

    // Clean up test product
    await prisma.product.delete({ where: { id: testProductId } });
  });

  // 4. Test Category Management (Fetch & Query)
  await test('Admin Category Queries', async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });
    if (!categories.length) throw new Error('No categories found');
    console.log(`   🏷️  Found ${categories.length} categories (${categories.map(c => c.name).join(', ')})`);
  });

  // 5. Test Customer & User Management
  await test('Admin Customer Queries', async () => {
    const customers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!customers.length) throw new Error('No users returned');
  });

  // 6. Test Orders Management Query
  await test('Admin Orders Query', async () => {
    const orders = await prisma.order.findMany({
      take: 5,
      include: {
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   📦 Found ${orders.length} orders in system`);
  });

  // 7. Test Customer Reviews Query
  await test('Admin Reviews Query', async () => {
    const reviews = await prisma.review.findMany({
      take: 5,
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
    console.log(`   ⭐ Found ${reviews.length} customer reviews`);
  });

  // 8. Test Newsletter Signups Query
  await test('Admin Newsletter Subscribers Query', async () => {
    const subscribers = await prisma.newsletterSignup.findMany({
      take: 5,
    });
    console.log(`   📰 Found ${subscribers.length} newsletter subscribers`);
  });

  // 9. Test Customer Complaints / Support Tickets Query
  await test('Admin Complaints / Support Query', async () => {
    const complaints = await prisma.helpRequest.findMany({
      take: 5,
    });
    console.log(`   💬 Found ${complaints.length} customer help & support requests`);
  });

  // 10. Test Pusher Real-Time Admin Notification Trigger
  await test('Pusher Real-Time Dispatch to Admin Presence Channel', async () => {
    const pusher = getPusherServer();
    if (!pusher) throw new Error('Pusher server instance is null');
    await pusher.trigger('presence-admin-dashboard', 'admin-notification', {
      id: `test-${Date.now()}`,
      type: 'INFO',
      message: 'Workflow self-test notification',
      createdAt: new Date().toISOString(),
    });
  });

  console.log('\n========================================================');
  console.log(`🏁 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

testAdminWorkflows().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
