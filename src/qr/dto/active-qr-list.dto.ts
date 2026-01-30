import { ApiProperty } from '@nestjs/swagger';
import { QrTokenType } from './generate-qr.dto';

export class ActiveQrItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  token: string;

  @ApiProperty({ enum: QrTokenType })
  type: QrTokenType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  isUsed: boolean;

  @ApiProperty({ required: false })
  usedBy?: string;

  @ApiProperty({ required: false })
  usedAt?: Date;

  @ApiProperty()
  remainingMinutes: number;
}

export class ActiveQrListResponseDto {
  @ApiProperty({ type: [ActiveQrItemDto] })
  tokens: ActiveQrItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  activeCount: number;

  @ApiProperty()
  expiredCount: number;
}
