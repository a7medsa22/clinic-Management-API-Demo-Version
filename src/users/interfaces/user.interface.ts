import { userStatusInfo } from 'src/common/enums/userStatus.enum';
import { userRoleInfo } from './userRole.interface';

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: userRoleInfo;
  status: userStatusInfo;
  isActive: boolean;
  isProfileComplete: boolean;
  profilePhoto: string | null;
}
