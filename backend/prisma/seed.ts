import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database content...');

  // 1. Ensure Category
  const category = await prisma.category.upsert({
    where: { slug: 'grips' },
    update: {
      name: 'Hijab Grips',
      description: 'Engineered anti-slip undercaps and silicone grip matrices.',
    },
    create: {
      name: 'Hijab Grips',
      slug: 'grips',
      description: 'Engineered anti-slip undercaps and silicone grip matrices.',
    },
  });

  // 2. Ensure Flagship Products
  const products = [
    {
      title: 'HIJAB GRIP Black',
      slug: 'hijab-grip-black',
      description: 'The black Hijab Grip, worn under your scarf to hold it in place without pins or hairline friction.',
      features: ['High Elasticity', 'Zero Slipping', 'Weightless Airflow', '100% Silicone Matrix'],
      fabric: '100% Medical Grade Silicone',
      colors: ['Black'],
      images: ['/assets/images/grip-closeup-800.webp', '/assets/images/model-olive-hijab-800.webp'],
      isFeatured: true,
      categoryId: category.id,
    },
    {
      title: 'Trio Pack: 3 Black Grips',
      slug: 'black-grip-trio-pack',
      description: 'Get 3 black grips at a special bundle price. Ask us on WhatsApp for today\'s offer.',
      features: ['3x Black Grips', 'Bundle Offer', 'Washable in 10s'],
      fabric: '100% Medical Grade Silicone',
      colors: ['Black'],
      images: ['/assets/images/grip-closeup-800.webp'],
      isFeatured: true,
      categoryId: category.id,
    },
  ];

  const allowedSlugs = products.map((p) => p.slug);
  await prisma.product.deleteMany({
    where: { slug: { notIn: allowedSlugs } },
  });

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        features: p.features,
        fabric: p.fabric,
        colors: p.colors,
        images: p.images,
        isFeatured: p.isFeatured,
        categoryId: p.categoryId,
      },
      create: p,
    });
  }

  // 3. Ensure Settings
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {
      businessName: 'Hijab World',
      tagline: 'BY HIJAB WORLD',
      whatsappNumber: '918861720050',
      instagramUrl: 'https://www.instagram.com/hijab_worl',
      facebookUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
      emailAddress: null,
      phoneNumber: '',
      address: '428 Modest Atelier Blvd, Design District',
      bannerText: 'ENGINEERED ZERO SLIPPING • HAIRLINE PRESSURE RELIEF • SHIPS WORLDWIDE',
      showBanner: true,
    },
    create: {
      id: 'default',
      businessName: 'Hijab World',
      tagline: 'BY HIJAB WORLD',
      whatsappNumber: '918861720050',
      instagramUrl: 'https://www.instagram.com/hijab_worl',
      facebookUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
      emailAddress: null,
      phoneNumber: '',
      address: '428 Modest Atelier Blvd, Design District',
      bannerText: 'ENGINEERED ZERO SLIPPING • HAIRLINE PRESSURE RELIEF • SHIPS WORLDWIDE',
      showBanner: true,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
