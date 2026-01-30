import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();

    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      this.logger.warn('Missing token on WS connection');
      throw new UnauthorizedException('Missing token');
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }
      client.data = client.data || {};
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      return true;
    } catch (err) {
      this.logger.warn('Invalid WS token', err?.message || err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
