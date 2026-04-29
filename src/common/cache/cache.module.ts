import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { UserCacheService } from './user-cache.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RedisService, UserCacheService],
  exports: [RedisService, UserCacheService],
})
export class CacheModule {}
