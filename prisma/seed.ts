import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users
  console.log('Creating users...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@naazbook.com' },
    update: {},
    create: {
      email: 'admin@naazbook.com',
      name: 'Admin User',
      password: await hash('admin123', 12),
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@naazbook.com' },
    update: {},
    create: {
      email: 'customer@naazbook.com',
      name: 'John Reader',
      password: await hash('customer123', 12),
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Users created')

  // Create categories
  console.log('Creating categories...')
  const quranCategory = await prisma.category.upsert({
    where: { slug: 'quran-tafseer' },
    update: {},
    create: {
      name: 'Quran & Tafseer',
      description: 'Authentic Qurans and detailed Tafseer books.',
      slug: 'quran-tafseer',
      image: '/Images/Riyadh as-Salihin.jpg',
      isActive: true,
    },
  })

  const hadithCategory = await prisma.category.upsert({
    where: { slug: 'hadith' },
    update: {},
    create: {
      name: 'Hadith Collections',
      description: 'Classical and contemporary collections of Hadith.',
      slug: 'hadith',
      image: '/Images/Sahih Al-Bukhari.jpg',
      isActive: true,
    },
  })

  const fiqhCategory = await prisma.category.upsert({
    where: { slug: 'fiqh' },
    update: {},
    create: {
      name: 'Islamic Jurisprudence',
      description: 'Books on Fiqh and Islamic law.',
      slug: 'fiqh',
      image: '/Images/Tafseer Ibn Kathir.jpg',
      isActive: true,
    },
  })

  const historyCategory = await prisma.category.upsert({
    where: { slug: 'history' },
    update: {},
    create: {
      name: 'Islamic History',
      description: 'Books on the history of Islam and Muslim civilizations.',
      slug: 'history',
      image: '/Images/tareek_e_islam_akbar_shah_urdu_hasanat.jpg',
      isActive: true,
    },
  })

  console.log('✅ Categories created')

  // Create products for Quran & Tafseer category
  console.log('Creating Quran & Tafseer books...')
  const quranProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'QURAN-001' },
      update: {},
      create: {
        name: 'The Noble Quran',
        description: 'A beautiful edition of the Noble Quran with English translation.',
        price: 14.99,
        comparePrice: 19.99,
        images: ['/Images/Riyadh as-Salihin.jpg'],
        sku: 'QURAN-001',
        barcode: '9781234567890',
        weight: 500.00,
        dimensions: '21x14x3 cm',
        stock: 100,
        isActive: true,
        isFeatured: true,
        slug: 'the-noble-quran',
        categoryId: quranCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TAFSEER-001' },
      update: {},
      create: {
        name: 'Tafseer Ibn Kathir',
        description: 'Comprehensive tafseer of the Quran by Ibn Kathir.',
        price: 39.99,
        comparePrice: 49.99,
        images: ['/Images/Tafseer Ibn Kathir.jpg'],
        sku: 'TAFSEER-001',
        barcode: '9781234567891',
        weight: 1200.00,
        dimensions: '24x17x6 cm',
        stock: 50,
        isActive: true,
        isFeatured: true,
        slug: 'tafseer-ibn-kathir',
        categoryId: quranCategory.id,
      },
    }),
  ])

  // Create products for Hadith category
  console.log('Creating Hadith books...')
  const hadithProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'HADITH-001' },
      update: {},
      create: {
        name: 'Sahih Al-Bukhari',
        description: 'The most authentic collection of Hadith.',
        price: 29.99,
        comparePrice: 34.99,
        images: ['/Images/Sahih Al-Bukhari.jpg'],
        sku: 'HADITH-001',
        barcode: '9781234567892',
        weight: 900.00,
        dimensions: '22x15x5 cm',
        stock: 60,
        isActive: true,
        isFeatured: true,
        slug: 'sahih-al-bukhari',
        categoryId: hadithCategory.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'HADITH-002' },
      update: {},
      create: {
        name: 'Riyadh as-Salihin',
        description: 'A classic collection of authentic Hadiths.',
        price: 19.99,
        comparePrice: 24.99,
        images: ['/Images/Riyadh as-Salihin.jpg'],
        sku: 'HADITH-002',
        barcode: '9781234567893',
        weight: 700.00,
        dimensions: '21x14x4 cm',
        stock: 80,
        isActive: true,
        isFeatured: false,
        slug: 'riyadh-as-salihin',
        categoryId: hadithCategory.id,
      },
    }),
  ])

  // Create products for Fiqh category
  console.log('Creating Fiqh books...')
  const fiqhProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'FIQH-001' },
      update: {},
      create: {
        name: 'Fiqh-us-Sunnah',
        description: 'A comprehensive guide to Islamic jurisprudence.',
        price: 24.99,
        comparePrice: 29.99,
        images: ['/Images/Padagogy in Islamic Education.jpeg'],
        sku: 'FIQH-001',
        barcode: '9781234567894',
        weight: 800.00,
        dimensions: '23x16x4 cm',
        stock: 40,
        isActive: true,
        isFeatured: true,
        slug: 'fiqh-us-sunnah',
        categoryId: fiqhCategory.id,
      },
    }),
  ])

  // Create products for History category
  console.log('Creating Islamic History books...')
  const historyProducts = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'HIST-001' },
      update: {},
      create: {
        name: 'Tareekh-e-Islam',
        description: 'A detailed account of Islamic history.',
        price: 17.99,
        comparePrice: 22.99,
        images: ['/Images/tareek_e_islam_akbar_shah_urdu_hasanat.jpg'],
        sku: 'HIST-001',
        barcode: '9781234567895',
        weight: 600.00,
        dimensions: '21x14x3 cm',
        stock: 30,
        isActive: true,
        isFeatured: false,
        slug: 'tareekh-e-islam',
        categoryId: historyCategory.id,
      },
    }),
  ])

  console.log('✅ Products created')

  // Create sample reviews
  console.log('Creating sample reviews...')
  const allProducts = [...quranProducts, ...hadithProducts, ...fiqhProducts, ...historyProducts]
  
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
  console.log(`   - ${4} categories (Quran & Tafseer, Hadith, Fiqh, History)`)
  console.log(`   - ${8} products (2 per category)`)
  console.log(`   - ${8} reviews`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
