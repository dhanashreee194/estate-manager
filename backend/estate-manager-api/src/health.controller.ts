import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let db: 'connected' | 'error' = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }
    return {
      status: db === 'connected' ? 'ok' : 'degraded',
      service: 'estate-manager-api',
      db,
      timestamp: new Date().toISOString(),
    };
  }
}
