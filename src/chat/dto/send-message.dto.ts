import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Message too long (max 5000 characters)' })
  content: string;

  @IsOptional()
  @IsString()
  messageType?: string; // TEXT, SYSTEM
}
