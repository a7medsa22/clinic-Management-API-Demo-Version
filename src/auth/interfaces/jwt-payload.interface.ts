import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  status: UserStatus;
  doctorId?: string | null;
  patientId?: string | null;
  iat?: number; // issued at
  exp?: number; // expires at
}

export interface RefreshJwtPayload {
  sub: string;
  tokenId: string;
}
export interface UserRoleType {
  role: UserRole;
}
