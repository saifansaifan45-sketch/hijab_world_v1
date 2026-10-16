import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { category?: string; search?: string }) {
    const where: any = { isAvailable: true };

    if (query?.category && query.category !== 'all') {
      where.category = {
        slug: query.category,
      };
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(data: any) {
    // Ensure category exists
    let category = await this.prisma.category.findFirst({
      where: { slug: data.categorySlug || 'grips' },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: data.categoryName || 'Hijab Grips & Foundations',
          slug: data.categorySlug || 'grips',
          description: 'Engineered anti-slip undercaps & grips',
        },
      });
    }

    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now();

    return this.prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        features: data.features || [],
        fabric: data.fabric || '100% Medical Grade Silicone',
        colors: data.colors || [],
        images: data.images || [],
        categoryId: category.id,
        isFeatured: data.isFeatured ?? true,
        isAvailable: data.isAvailable ?? true,
      },
      include: { category: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        features: data.features,
        fabric: data.fabric,
        colors: data.colors,
        images: data.images,
        isFeatured: data.isFeatured,
        isAvailable: data.isAvailable,
      },
      include: { category: true },
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
