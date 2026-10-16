import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    // Fallback to local default if backend is starting
  }

  return NextResponse.json({
    success: true,
    data: {
      businessName: 'HIJAB GRIP™',
      tagline: 'BY HIJAB WORLD',
      whatsappNumber: '918861720050',
      whatsappFormatted: '+91 88617 20050',
      instagramUrl: 'https://www.instagram.com/hijab_worl',
      phoneNumber: '',
      facebookUrl: '',
      address: '428 Modest Atelier Blvd, Design District',
      bannerText: 'ENGINEERED ZERO SLIPPING • HAIRLINE PRESSURE RELIEF • SHIPS WORLDWIDE',
    },
  });
}
