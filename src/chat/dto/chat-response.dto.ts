export class ChatParticipantDto {
  id: string;
  userId: string;
  name: string;
  // avatar: string | null;
}

export class ChatDetailsResponseDto {
  chatId: string;
  connectionId: string;
  doctor: ChatParticipantDto;
  patient: ChatParticipantDto;
}
