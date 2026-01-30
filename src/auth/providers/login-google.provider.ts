import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GoogleUser } from '../interfaces/google-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginProvider } from './login.provider';
import { UserStatus } from '@prisma/client';

@Injectable()
export class GoogleOauth {
  constructor(
    private prisma: PrismaService,
    private readonly loginProvider: LoginProvider,
  ) {}
  async googleLogin(googleUser: GoogleUser, req: Request) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      // User exists, update if they were using LOCAL auth
      if (user.authProvider == 'LOCAL') {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: 'GOOGLE',
            providerId: googleUser.providerId,
          },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email!,
          firstName: googleUser.firstName ?? '',
          lastName: googleUser.lastName ?? '',
          profilePhoto: googleUser.avatar ?? undefined,
          authProvider: 'GOOGLE',
          providerId: googleUser.providerId,
          status: UserStatus.ACTIVE,
          isActive: true,
          approvedAt: new Date(),
          isProfileComplete: true,
        },
      });
    }

    return this.loginProvider.login(user, req);
  }
}
