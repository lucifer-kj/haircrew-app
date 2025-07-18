import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users
  console.log('Creating users...')
  await prisma.user.upsert({
    where: { email: 'admin@haircrew.com' },
    update: {},
    create: {
      email: 'admin@haircrew.com',
      name: 'Admin User',
      password: await hash('admin123', 12),
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@haircrew.com' },
    update: {},
    create: {
      email: 'customer@haircrew.com',
      name: 'John Customer',
      password: await hash('customer123', 12),
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Users created')

  // Create categories
  console.log('Creating categories...')
  const shampooCategory = await prisma.category.upsert({
    where: { slug: 'shampoo' },
    update: {},
    create: {
      name: 'Shampoo',
      description: 'Professional hair care shampoos for all hair types',
      slug: 'shampoo',
      image: '/Images/c-shampoo.jpg',
      isActive: true,
    },
  })

  const conditionerCategory = await prisma.category.upsert({
    where: { slug: 'conditioner' },
    update: {},
    create: {
      name: 'Conditioner',
      description:
        'Nourishing conditioners to keep your hair healthy and smooth',
      slug: 'conditioner',
      image: '/Images/c-conditioner.jpg',
      isActive: true,
    },
  })

  const treatmentCategory = await prisma.category.upsert({
    where: { slug: 'treatment' },
    update: {},
    create: {
      name: 'Treatment',
      description:
        'Specialized hair treatments for deep conditioning and repair',
      slug: 'treatment',
      image: '/Images/c-treatment.jpg',
      isActive: true,
    },
  })

  console.log('✅ Categories created')

  // Create products for Shampoo category
  console.log('Creating shampoo products...')
  const shampooProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'SHAMPOO-001' },
      update: {},
      create: {
        name: 'Hydrating Shampoo',
        description:
          'Deeply hydrating shampoo for dry and damaged hair. Enriched with natural oils and vitamins.',
        price: 24.99,
        comparePrice: 29.99,
        images: ['/Images/p1.jpg', '/Images/p2.jpg'],
        sku: 'SHAMPOO-001',
        barcode: '1234567890123',
        weight: 250.0,
        dimensions: '8x4x2 cm',
        stock: 50,
        isActive: true,
        isFeatured: true,
        slug: 'hydrating-shampoo',
        categoryId: shampooCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SHAMPOO-002' },
      update: {},
      create: {
        name: 'Volumizing Shampoo',
        description:
          "Adds volume and body to fine, limp hair. Lightweight formula that won't weigh hair down.",
        price: 22.99,
        comparePrice: 27.99,
        images: ['/Images/p2.jpg', '/Images/p3.jpg'],
        sku: 'SHAMPOO-002',
        barcode: '1234567890124',
        weight: 250.0,
        dimensions: '8x4x2 cm',
        stock: 35,
        isActive: true,
        isFeatured: false,
        slug: 'volumizing-shampoo',
        categoryId: shampooCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SHAMPOO-003' },
      update: {},
      create: {
        name: 'Color-Protecting Shampoo',
        description:
          'Sulfate-free shampoo that preserves hair color and prevents fading.',
        price: 26.99,
        comparePrice: 31.99,
        images: ['/Images/p3.jpg', '/Images/p1.jpg'],
        sku: 'SHAMPOO-003',
        barcode: '1234567890125',
        weight: 250.0,
        dimensions: '8x4x2 cm',
        stock: 40,
        isActive: true,
        isFeatured: true,
        slug: 'color-protecting-shampoo',
        categoryId: shampooCategory.id,
      },
    }),
  ])

  // Create products for Conditioner category
  console.log('Creating conditioner products...')
  const conditionerProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'COND-001' },
      update: {},
      create: {
        name: 'Moisturizing Conditioner',
        description:
          'Intensive moisture conditioner for dry and damaged hair. Leaves hair soft and manageable.',
        price: 26.99,
        comparePrice: 31.99,
        images: ['/Images/p1.jpg', '/Images/p2.jpg'],
        sku: 'COND-001',
        barcode: '1234567890126',
        weight: 250.0,
        dimensions: '8x4x2 cm',
        stock: 45,
        isActive: true,
        isFeatured: true,
        slug: 'moisturizing-conditioner',
        categoryId: conditionerCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'COND-002' },
      update: {},
      create: {
        name: 'Smoothing Conditioner',
        description:
          'Anti-frizz conditioner that smooths hair cuticles and reduces frizz.',
        price: 24.99,
        comparePrice: 29.99,
        images: ['/Images/p2.jpg', '/Images/p3.jpg'],
        sku: 'COND-002',
        barcode: '1234567890127',
        weight: 250.0,
        dimensions: '8x4x2 cm',
        stock: 30,
        isActive: true,
        isFeatured: false,
        slug: 'smoothing-conditioner',
        categoryId: conditionerCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'COND-003' },
      update: {},
      create: {
        name: 'Strengthening Conditioner',
        description:
          'Protein-rich conditioner that strengthens hair and reduces breakage.',
        price: 28.99,
        comparePrice: 33.99,
        images: ['/Images/p3.jpg', '/Images/p1.jpg'],
        sku: 'COND-003',
        barcode: '1234567890128',
        weight: 250.0,
        dimensions: '8x4x2 cm',
        stock: 25,
        isActive: true,
        isFeatured: true,
        slug: 'strengthening-conditioner',
        categoryId: conditionerCategory.id,
      },
    }),
  ])

  // Create products for Treatment category
  console.log('Creating treatment products...')
  const treatmentProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'TREAT-001' },
      update: {},
      create: {
        name: 'Deep Conditioning Mask',
        description:
          'Intensive deep conditioning treatment for severely damaged hair.',
        price: 34.99,
        comparePrice: 39.99,
        images: ['/Images/p1.jpg', '/Images/p2.jpg'],
        sku: 'TREAT-001',
        barcode: '1234567890129',
        weight: 200.0,
        dimensions: '8x4x2 cm',
        stock: 20,
        isActive: true,
        isFeatured: true,
        slug: 'deep-conditioning-mask',
        categoryId: treatmentCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TREAT-002' },
      update: {},
      create: {
        name: 'Hair Repair Serum',
        description:
          'Lightweight serum that repairs split ends and prevents further damage.',
        price: 29.99,
        comparePrice: 34.99,
        images: ['/Images/p2.jpg', '/Images/p3.jpg'],
        sku: 'TREAT-002',
        barcode: '1234567890130',
        weight: 100.0,
        dimensions: '6x3x2 cm',
        stock: 30,
        isActive: true,
        isFeatured: false,
        slug: 'hair-repair-serum',
        categoryId: treatmentCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TREAT-003' },
      update: {},
      create: {
        name: 'Scalp Treatment',
        description:
          'Soothing scalp treatment that reduces dandruff and promotes healthy hair growth.',
        price: 32.99,
        comparePrice: 37.99,
        images: ['/Images/p3.jpg', '/Images/p1.jpg'],
        sku: 'TREAT-003',
        barcode: '1234567890131',
        weight: 150.0,
        dimensions: '7x4x2 cm',
        stock: 15,
        isActive: true,
        isFeatured: true,
        slug: 'scalp-treatment',
        categoryId: treatmentCategory.id,
      },
    }),
  ])

  console.log('✅ Products created')

  // Create sample reviews
  console.log('Creating sample reviews...')
  const allProducts = [
    ...shampooProducts,
    ...conditionerProducts,
    ...treatmentProducts,
  ]

  for (const product of allProducts) {
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: customerUser.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        userId: customerUser.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
        title: `Great ${product.name}`,
        comment: `I love this ${product.name.toLowerCase()}. It works wonders for my hair!`,
        isVerified: true,
      },
    })
  }

  console.log('✅ Reviews created')

  console.log('🎉 Database seeding completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - ${2} users (admin + customer)`)
  console.log(`   - ${3} categories (shampoo, conditioner, treatment)`)
  console.log(`   - ${9} products (3 per category)`)
  console.log(`   - ${9} reviews`)
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
