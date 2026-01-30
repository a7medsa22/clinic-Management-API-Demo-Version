import { UserRole } from '@prisma/client';
export const ChatMapper = {
  toParticipantDto(participant) {
    return {
      id: participant.id,
      userId: participant.userId,
      name: `${participant.user.firstName} ${participant.user.lastName}`,
      avatar: participant.user.avatar || null,
    };
  },

  toConnectionListItem(connection, role: UserRole) {
    const participant =
      role === UserRole.DOCTOR
        ? this.toParticipantDto(connection.patient)
        : this.toParticipantDto(connection.doctor);

    return {
      connectionId: connection.id,
      chatId: connection.chat?.id || null,
      participant: {
        ...participant,
        role: role === UserRole.DOCTOR ? UserRole.PATIENT : UserRole.DOCTOR,
      },
      lastMessage: connection.chat?.messages?.[0] || null,
      lastMessageAt: connection.lastMessageAt,
      unreadCount: connection.unreadCount,
      status: connection.status,
    };
  },

  toChatDetailsDto(chat) {
    return {
      chatId: chat.id,
      connectionId: chat.connection.id,
      doctor: this.toParticipantDto(chat.connection.doctor),
      patient: this.toParticipantDto(chat.connection.patient),
    };
  },
};
