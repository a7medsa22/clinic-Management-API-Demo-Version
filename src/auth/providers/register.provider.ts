import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CompleteProfileDto, RegisterBasicDto, RegisterInitDto, RegisterVerifyEmailDto, VerifyOtpDto } from '../dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpProvider } from './otp.provider';
import { UsersService } from 'src/users/users.service';
import { userStatusInfo } from 'src/common/enums/userStatus.enum';
import { userRoleInfo } from 'src/common/enums/userRole.enum';


@Injectable()
export class RegisterProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpProvider,
    private readonly usersService: UsersService,
  ) { }

  /**
   * 
   * @param dto RegisterInitDto 
   * @returns { success: boolean; message: string; data: { tempUserId: string; role: userRoleInfo; status: string } }
   */
  async registerInit(dto: RegisterInitDto): Promise<{
    success: boolean;
    message: string;
    data: { tempUserId: string; role: string; status: string }
  }> {
    const { role } = dto;

    // Create temporary user with just role
    const tempUser = await this.usersService.createInitialUser(role);

    return {
      success: true,
      message: 'Role selected. Proceed with registration.',
      data: {
        tempUserId: tempUser.id,
        role: tempUser.role,
        status: tempUser.status,
      },
    };
  }

  /*Step 2: Register basic info (email, password, name) */

  async registerBasice(dto: RegisterBasicDto): Promise<{
    message: string;
    data: { userId: string; status: string }
  }> {

    // Validate password confirmation
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if temp user exists
    const tempUser = await this.prisma.user.findUnique({
      where: { id: dto.tempUserId },
    });

    if (!tempUser || tempUser.status !== userStatusInfo.INIT) {
      throw new BadRequestException('Invalid registration session');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser && existingUser.id !== dto.tempUserId) {
      throw new ConflictException('Email already registered');
    }


    // Hash password
    const hash = await this.hashPassword(dto.password);

    // Update temp user with real data
    const updatedUser = await this.usersService.updateBasicData(dto, hash);

    // Generate and send email verification OTP
    await this.otp.generateAndSendOtp(updatedUser.id, 'EMAIL_VERIFICATION');

    return {

      message: 'Basic info saved. Please verify your email.',
      data: {
        userId: updatedUser.id,
        status: updatedUser.status,
      },
    }
  }

  /**
   * 
   * @param dto RegisterVerifyEmailDto 
   * @returns { success: boolean; message: string; data: { userId: string; status: string } }
   */
  async registerVerifyEmail(dto: RegisterVerifyEmailDto): Promise<{
    data: { userId: string; status: string, message: string }
  }> {
    const { userId, otp } = dto;

    const isValid = await this.otp.verifyOtp(userId, otp, 'EMAIL_VERIFICATION');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Update user status to approved (or keep pending for admin approval)
    await this.usersService.updateUserStatus(userId, userStatusInfo.EMAIL_VERIFIED, 2);
    

    return {
      data: {
        userId,
        status: 'EMAIL_VERIFIED',
        message: 'Email verified successfully. Please complete your profile.',
      },
    };
  }

  /**
   * (Step 4)
   * @param userId string 
   * @param dto CompleteProfileDto 
   * @returns { success: boolean; message: string; data: { userId: string; status: string } }
   */
  async completeUserProfile(userId: string, dto: CompleteProfileDto): Promise<{
    data: { userId: string; status: string, message: string };
  }> {
    const { phone, nationalId, medicalCardNumber } = dto;

    // Get user
    const user = await this.usersService.getUserOrThrow(userId);

    if (!user || user.status !== userStatusInfo.EMAIL_VERIFIED) {
      throw new BadRequestException('Invalid registration session');
    }

    // Check if nationalId already exists and Update user with profile data
      const updatedUser = await this.usersService.completeAdditionalProfile(userId, nationalId, phone);

    // Create role-specific profile
    if (user.role === userRoleInfo.patient) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    } else if (user.role === userRoleInfo.doctor) {
      // For doctors, we'll need specialization later
      // For now, create basic doctor profile
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
          specializationId: null, // Will be updated later
          licenseNumber: medicalCardNumber,
        },
      });
    }

    return {
      data: {
        message: 'Profile completed successfully. Please wait for admin approval.',
        userId: updatedUser.id,
        status: updatedUser.status,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }
}
