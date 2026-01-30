import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectRequestDto {
  @ApiProperty({
    example: 'Currently not accepting new patients',
    description: 'Reason for rejection (will be sent to patient)',
  })
  @IsString()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  @MaxLength(500, { message: 'Rejection reason cannot exceed 500 characters' })
  reason: string;
}
