import { Module } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { ChatController } from './chat.controller';
import { MessageService } from './message.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { forwardRef } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisService } from 'src/common/cache/redis.service';
import { ChatEventsService } from './service/chat-events.service';
import { WsJwtGuard } from '../auth/guards/ws-Jwt.guard';
import { ActiveUsersService } from './service/active-users.service';
import { UserCacheService } from '../common/cache/user-cache.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    ChatGateway,
    RedisService,
    ActiveUsersService,
    ChatEventsService,
    WsJwtGuard,
    UserCacheService,
  ],
  exports: [ChatService, MessageService, ChatGateway],
})
export class ChatModule {}
