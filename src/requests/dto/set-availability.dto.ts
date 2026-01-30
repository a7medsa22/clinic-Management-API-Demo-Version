import {
  IsArray,
  IsObject,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAvailabilityDto {
  @ApiProperty({
    example: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    description: 'Available days (lowercase day names)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one day must be selected' })
  @ArrayMaxSize(7, { message: 'Cannot exceed 7 days' })
  availableDays?: string[];

  @ApiProperty({
    example: { start: '09:00', end: '17:00' },
    description: 'Available hours (24-hour format HH:MM)',
    required: false,
  })
  @IsOptional()
  @IsObject()
  availableHours?: { start: string; end: string };
}
