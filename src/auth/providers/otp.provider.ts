import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class OtpProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async generateAndSendOtp(
    userId: string,
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
  ): Promise<void> {
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otp.deleteMany({ where: { userId, type } });

    await this.prisma.otp.create({
      data: { userId, code: otpCode, type, expiresAt, isUsed: false },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      if (type === 'EMAIL_VERIFICATION') {
        await this.emailService.sendEmailVerificationOtp(
          user.email,
          user.firstName,
          otpCode,
        );
      } else if (type === 'PASSWORD_RESET') {
        await this.emailService.sendPasswordResetOtp(
          user.email,
          user.firstName,
          otpCode,
        );
      }
    }
  }

  async verifyOtp(
    userId: string,
    code: string,
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
  ): Promise<boolean> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        userId,
        code,
        type,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) return false;

    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    return true;
  }

  async resendOtp(
    userId: string,
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const recentOtp = await this.prisma.otp.findFirst({
      where: {
        userId,
        type,
        createdAt: { gt: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });

    if (recentOtp)
      throw new BadRequestException(
        'Please wait 2 minutes before requesting a new code',
      );

    await this.generateAndSendOtp(userId, type);
    return { message: `New ${type.toLowerCase()} code sent.` };
  }
}
