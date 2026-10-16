import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.siteSetting.create({
        data: {
          id: 'default',
          businessName: process.env.BRAND_NAME || 'Hijab World',
          tagline: process.env.TAGLINE || 'Elegance in Modesty',
          aboutText: 'Haute modesty atelier designed for modern elegance and comfort.',
          whatsappNumber: process.env.WHATSAPP_NUMBER || '918861720050',
          instagramUrl: process.env.INSTAGRAM_URL || 'https://www.instagram.com/hijab_worl',
          facebookUrl: process.env.FACEBOOK_URL || '',
          tiktokUrl: process.env.TIKTOK_URL || '',
          youtubeUrl: process.env.YOUTUBE_URL || '',
          emailAddress: process.env.CONCIERGE_EMAIL || null,
          phoneNumber: process.env.PHONE_NUMBER || '',
          address: process.env.STORE_ADDRESS || '428 Modest Atelier Blvd, Design District',
          bannerText: 'ENGINEERED ZERO SLIPPING • HAIRLINE PRESSURE RELIEF • SHIPS WORLDWIDE',
          showBanner: true,
        },
      });
    }

    const { emailAddress, ...publicSettings } = settings;
    return publicSettings;
  }
}
