import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

export interface AuthUser extends JwtPayload {
  profileAvg?: any;
}
export interface AuthUserforRes extends AuthUser {
  firstName: string;
  lastName: string;
}
export interface RequestWithUser extends Request {
  user: AuthUser;
}
