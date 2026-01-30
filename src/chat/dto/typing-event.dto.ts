import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class TypingEventDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsBoolean()
  isTyping: boolean;
}
