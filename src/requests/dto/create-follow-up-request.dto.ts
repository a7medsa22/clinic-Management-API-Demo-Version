import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowUpRequestDto {
  @ApiProperty({
    example: 'uuid-of-doctor',
    description: 'Doctor ID to send request to',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    example: 'https://storage.example.com/prescriptions/image.jpg',
    description: 'URL of uploaded prescription image (required)',
  })
  @IsString()
  prescriptionImage: string;

  @ApiProperty({
    example: 'I need follow-up for my blood pressure medication',
    required: false,
    description: 'Additional notes or symptoms',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;
}
