import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MedicationDto } from './medication.dto';

export class UpdatePrescriptionDto {
  @ApiProperty({
    type: [MedicationDto],
    description: 'Array of medications in the prescription',
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1, { message: 'At least one medication is required' })
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];

  @ApiProperty({
    example: 'Continue current treatment and monitor blood pressure daily',
    required: false,
    description: 'General prescription notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Set prescription as active or inactive',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
