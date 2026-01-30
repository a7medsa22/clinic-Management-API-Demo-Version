import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'uuid-from-init-step', description: 'User ID' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  nationalId?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isProfileComplete: boolean;

  @ApiProperty({ example: 2 })
  @IsNumber()
  registrationStep: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({
    description: 'Patient profile (only for patients)',
    required: false,
  })
  profile?:
    | {
        id: string;
        dateOfBirth?: Date;
        gender?: string;
        address?: string;
        emergencyContact?: string;
        bloodType?: string;
        allergies?: string;
      }
    | {
        id: string;
        specializationId: string;
        licenseNumber?: string;
        experience?: number;
        bio?: string;
        consultationFee?: number;
        workingDays?: string[];
        workingHours?: { start: string; end: string };
        specialization: {
          id: string;
          name: string;
          nameAr?: string;
        };
      };
}
