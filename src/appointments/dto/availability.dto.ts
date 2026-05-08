import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class CreateAvailabilityDto {
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsInt()
  @Min(0)
  @Max(1440)
  startTime!: number; // minutes from midnight

  @IsInt()
  @Min(0)
  @Max(1440)
  endTime!: number; // minutes from midnight

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(480) // max 8 hours
  slotDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxAppointmentsPerDay?: number;
}

export class CreateMultipleAvailabilitiesDto {
  availabilities!: CreateAvailabilityDto[];
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  startTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  endTime?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(480)
  slotDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxAppointmentsPerDay?: number;
}

export class CreateBreakDto {
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsInt()
  @Min(0)
  @Max(1440)
  startTime!: number;

  @IsInt()
  @Min(0)
  @Max(1440)
  endTime!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  reason?: string;
}

export class UpdateBreakDto {
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  startTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  endTime?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  reason?: string;
}

export class CreateDayOffDto {
  @IsString()
  date!: string; // ISO date string (YYYY-MM-DD)

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  reason?: string;
}

export class CreateMultipleDaysOffDto {
  daysOff!: CreateDayOffDto[];
}

// Request DTOs for endpoints (include doctorId)
export class CreateAvailabilityRequestDto extends CreateAvailabilityDto {
  @IsString()
  doctorId!: string;
}

export class CreateMultipleAvailabilitiesRequestDto extends CreateMultipleAvailabilitiesDto {
  @IsString()
  doctorId!: string;
}

export class UpdateAvailabilityRequestDto extends UpdateAvailabilityDto {
  @IsString()
  doctorId!: string;
}

export class CreateBreakRequestDto extends CreateBreakDto {
  @IsString()
  doctorId!: string;
}

export class UpdateBreakRequestDto extends UpdateBreakDto {
  @IsString()
  doctorId!: string;
}

export class CreateDayOffRequestDto extends CreateDayOffDto {
  @IsString()
  doctorId!: string;
}

export class CreateMultipleDaysOffRequestDto extends CreateMultipleDaysOffDto {
  @IsString()
  doctorId!: string;
}