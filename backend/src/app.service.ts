import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hijab World API v1 Online';
  }

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'OK',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        status: 'ERROR',
        database: 'disconnected',
        error: e.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
