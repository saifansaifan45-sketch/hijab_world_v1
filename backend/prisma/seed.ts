import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database content...');

  // 1. Ensure Category
  const category = await prisma.category.upsert({
    where: { slug: 'grips' },
    update: {},
    create: {
      name: 'Hijab Grips & Foundations',
      slug: 'grips',
      description: 'Engineered anti-slip undercaps, silicone lattice matrices, and foundations.',
    },
  });

  // 2. Ensure Flagship Products
  const products = [
    {
      title: 'Hijab Grip™ Honeycomb Band (Classic Onyx)',
      slug: 'hijab-grip-classic-onyx',
      description: 'High-elasticity silicone honeycomb matrix designed to keep your hijab firmly in place all day without heavy pressure, headaches, or hairline friction.',
      features: ['High Elasticity', 'Zero Slipping', 'Weightless Airflow', 'Hypoallergenic Medical Silicone'],
      fabric: '100% Medical Grade Silicone',
      colors: ['Classic Onyx Black', 'Warm Caramel Nude', 'Desert Cream Off-White'],
      images: ['/assets/images/grip_model_wearing.jpg', '/assets/images/grip_isolated_black.jpg', '/assets/images/grip_three_pack_tray.jpg'],
      isFeatured: true,
      categoryId: category.id,
    },
    {
      title: 'Hijab Grip™ Invisible Nude',
      slug: 'hijab-grip-caramel-nude',
      description: 'Matches skin tones and neutral scarves so the grip remains virtually invisible under lightweight silks, modal wraps, and sheer georgettes.',
      features: ['Invisible Finish', 'No Slipping', 'Anti-Headache', 'Hairline Protection'],
      fabric: 'Skin-Adaptive Silicone Matrix',
      colors: ['Warm Caramel Nude'],
      images: ['/assets/images/grip_three_pack_tray.jpg', '/assets/images/grip_model_wearing.jpg'],
      isFeatured: true,
      categoryId: category.id,
    },
    {
      title: 'The Everyday Essentials Trio (3-Pack Bundle)',
      slug: 'the-everyday-essentials-trio',
      description: 'The comprehensive foundation wardrobe box ensuring total invisible grip under any fabric transparency. Includes Onyx Black, Sand Nude, and Pure Ivory.',
      features: ['Curated 3-Pack', 'Full Tone Wardrobe', 'Washable in 10s', 'Dispatched within 24h'],
      fabric: '100% Medical Grade Silicone',
      colors: ['Onyx Black', 'Sand Nude', 'Pure Ivory'],
      images: ['/assets/images/grip_three_pack_tray.jpg'],
      isFeatured: true,
      categoryId: category.id,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
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
