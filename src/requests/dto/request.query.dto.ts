import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class RequestQueryDto {
  @ApiProperty({
    description: 'Page number',
    type: Number,
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    type: Number,
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by request status',
    type: String,
    example: 'PENDING',
    required: false,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
  })
  @IsOptional()
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
