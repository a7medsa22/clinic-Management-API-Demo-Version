import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { throws } from 'assert';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? ['query', 'info', 'warn']
          : ['warn', 'error'],
    });
  }
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }
  // Helper method for database health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  // Soft delete helper
  async softDelete<T>(model: any, where: any): Promise<T> {
    return await model.update({
      where,
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
  // Bulk operations helper
  async bulkCreate<T>(model: any, data: any): Promise<{ count: number }> {
    return model.createMeny({
      data,
      skipDuplicates: true,
    });
  }
}
