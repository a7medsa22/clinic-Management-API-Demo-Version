import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

// UpdateProfileDto
export class UpdateProfileDto {
  // Base user information
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  // Patient-specific fields
  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsEnum(['Male', 'Female'], {
    message: 'Gender must be either Male or Female',
  })
  gender?: string;

  @ApiProperty({ example: '123 Main Street, Cairo, Egypt', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+201987654321', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ example: 'O+', required: false })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty({ example: 'Penicillin, Peanuts', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  // Doctor-specific fields
  @ApiProperty({
    example: 'Experienced cardiologist with 10+ years of practice.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  experience?: number;

  @ApiProperty({ example: 500.0, required: false })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  consultationFee?: number;

  @ApiProperty({
    example: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  workingDays?: string[];

  @ApiProperty({
    example: { start: '09:00', end: '17:00' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  workingHours?: { start: string; end: string };
}

export class UserStatsResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty({
    type: 'object',
    properties: {
      init: { type: 'number' },
      pendingEmail: { type: 'number' },
      emailVerified: { type: 'number' },
      completed: { type: 'number' },
    },
  })
  registrationFlow: {
    init: number;
    pendingEmail: number;
    emailVerified: number;
    completed: number;
  };

  @ApiProperty({
    type: 'object',
    properties: {
      patients: { type: 'number' },
      doctors: { type: 'number' },
      admins: { type: 'number' },
    },
  })
  byRole: {
    patients: number;
    doctors: number;
    admins: number;
  };
}
