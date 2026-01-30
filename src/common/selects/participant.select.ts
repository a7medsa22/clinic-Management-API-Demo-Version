import { userBasicSelect } from './user.select';

export const participantSelect = {
  id: true, // doctor/patient id
  userId: true,
  user: { select: userBasicSelect },
} as const;
