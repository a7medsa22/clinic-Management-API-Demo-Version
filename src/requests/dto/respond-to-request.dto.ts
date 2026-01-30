import { IsArray, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondToRequestDto {
  @ApiProperty({
    example: ['wednesday', 'friday'],
    required: false,
    description: 'Days when doctor is available for communication',
  })
  @IsOptional()
  @IsArray()
  availableDays?: string[];

  @ApiProperty({
    example: { start: '17:00', end: '21:00' },
    required: false,
    description: 'Hours when doctor is available for communication',
  })
  @IsOptional()
  @IsObject()
  availableHours?: { start: string; end: string };
}
