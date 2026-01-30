import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MedicationDto } from './medication.dto';

export class CreatePrescriptionDto {
  @ApiProperty({
    type: [MedicationDto],
    description: 'Array of medications in the prescription',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one medication is required' })
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @ApiProperty({
    example: 'Continue current treatment and monitor blood pressure daily',
    required: false,
    description: 'General prescription notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
