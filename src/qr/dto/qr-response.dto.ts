import { ApiProperty } from '@nestjs/swagger';
import { QrTokenType } from './generate-qr.dto';

export class QrTokenResponseDto {
  @ApiProperty({
    description: 'QR Token ID',
  })
  id: string;

  @ApiProperty({
    description: 'QR token string',
  })
  token: string;

  @ApiProperty({
    description: 'QR Code as Base64 image',
    example: 'data:image/png;base64,iVBORw0KG...',
  })
  qrCodeImage: string;

  @ApiProperty({
    enum: QrTokenType,
    description: 'type of the QR token',
  })
  type: QrTokenType;

  @ApiProperty({
    description: 'time of creation',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'expiration time',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'remaining minutes until expiration',
  })
  remainingMinutes: number;

  @ApiProperty({
    description: 'whether the token has been used',
    default: false,
  })
  isUsed: boolean;

  @ApiProperty({
    description: 'doctor information',
    required: false,
  })
  doctor?: {
    id: string;
    name: string;
    specialty?: string;
  };
}

export class QrConnectionResponseDto {
  @ApiProperty({
    description: 'new connection ID',
  })
  connectionId: string;

  @ApiProperty({
    description: 'Doctor info',
  })
  doctor: {
    id: string;
    name: string;
    specialty?: string;
    licenseNumber?: string;
  };

  @ApiProperty({
    description: 'Patient info',
  })
  patient: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: 'connection date and time',
  })
  connectedAt: Date;

  @ApiProperty({
    description: 'connection method',
    example: 'QR_CODE',
  })
  connectionMethod: string;

  @ApiProperty({
    description: 'success message',
    example:
      'connection successful! the doctor can now access your patient file',
  })
  message: string;

  @ApiProperty({
    description: 'connection status',
    example: 'ACTIVE',
  })
  status: string;
}
