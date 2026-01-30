import { User, Doctor, Patient } from '@prisma/client';

export type UserWithRelations = User & {
  doctor?: Doctor | null;
  patient?: Patient | null;
};
