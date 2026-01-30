import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';

@Injectable()
export class ApprovedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        `Account is ${user.status.toLowerCase()}. Please contact support.`,
      );
    }

    return true;
  }
}
