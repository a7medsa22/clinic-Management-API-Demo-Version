import { AuthUserforRes } from './request-with-user.interface';

export interface AuthResponse {
  user: AuthUserforRes;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
