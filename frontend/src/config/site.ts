export const siteConfig = {
  businessName: 'HIJAB GRIP™',
  tagline: 'BY HIJAB WORLD',
  whatsappNumber: '918861720050',
  whatsappDefaultMessage: "Hi Hijab World, I'd like to know more about Hijab Grip.",
  instagramUrl: 'https://www.instagram.com/hijab_worl',
  instagramHandle: '@hijab_worl',
  facebookUrl: '', // Facebook link has not been provided. Keep empty to hide.
  phoneNumber: '', // Separate phone-call number has not been provided. Keep empty.
  address: '428 Modest Atelier Blvd, Design District',
  bannerText: 'ENGINEERED ZERO SLIPPING • HAIRLINE PRESSURE RELIEF • SHIPS WORLDWIDE',
};

export const OFFER_CONSTANT = "Get 3 black grips at a special bundle price. Ask us on WhatsApp for today's offer.";

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  colors: string[];
  features?: string[];
  images: string[];
  badge?: string;
}

export const fallbackProducts: ProductItem[] = [
  {
    id: 'hijab-grip-black',
    title: 'HIJAB GRIP Black',
    slug: 'hijab-grip-black',
    description: 'The black Hijab Grip, worn under your scarf to hold it in place.',
    colors: ['Black'],
    features: ['High Elasticity', 'Zero Slipping', 'Weightless Airflow', 'Silicone Grip Matrix'],
    images: ['/assets/images/grip-closeup-800.webp', '/assets/images/model-olive-hijab-800.webp'],
  },
  {
    id: 'black-grip-trio-pack',
    title: 'Trio Pack: 3 Black Grips',
    slug: 'black-grip-trio-pack',
    description: OFFER_CONSTANT,
    colors: ['Black'],
    features: ['3x Black Grips', 'Bundle Offer', 'Washable in 10s'],
    images: ['/assets/images/grip-closeup-800.webp'],
    badge: 'Bundle offer',
  },
];
