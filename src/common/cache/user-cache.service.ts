import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from './redis.service';

@Injectable()
export class UserCacheService {
  private readonly PREFIX = 'user:snapshot:';
  private readonly TTL_SECONDS = 60 * 60 * 24; // 24 hours

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) { }

  async getUserSnapshot(userId: string) {
    const key = `${this.PREFIX}${userId}`;

    // 1. Try cache first
    const cached = await this.redis.get<{
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    }>(key);

    if (cached) return cached;

    // 2. Not cached → fetch from DB
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) return null;

    // 3. Store in cache
    await this.redis.set(key, user, this.TTL_SECONDS);

    return user;
  }

  async invalidateUserSnapshot(userId: string) {
    const key = `${this.PREFIX}${userId}`;
    await this.redis.del(key);
  }
}
