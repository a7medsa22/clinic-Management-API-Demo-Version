import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSpecializationDto {
  @ApiProperty({
    example: 'Cardiology',
    description: 'Specialization name in English',
  })
  @IsString()
  @MinLength(2, {
    message: 'Specialization name must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Specialization name cannot exceed 100 characters',
  })
  name: string;

  @ApiProperty({
    example: 'أمراض القلب',
    description: 'Specialization name in Arabic',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Arabic name cannot exceed 100 characters' })
  nameAr?: string;

  @ApiProperty({
    example:
      'Medical specialty dealing with disorders of the heart and blood vessels',
    description: 'Specialization description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
}
