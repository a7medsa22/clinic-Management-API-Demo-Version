import { userStatusInfo } from 'src/common/enums/userStatus.enum';

export class UserStatePattern {
  public static getNextRegistrationStep(status: userStatusInfo): string {
    switch (status) {
      case userStatusInfo.INIT:
        return 'Step 2: Complete basic information';
      case userStatusInfo.PENDING_EMAIL_VERIFICATION:
        return 'Step 3: Verify email address';
      case userStatusInfo.EMAIL_VERIFIED:
        return 'Step 4: Complete profile';
      case userStatusInfo.PENDING_ADMIN_APPROVAL:
        return 'Under Review';
      case userStatusInfo.INACTIVE:
        return 'Contact support';
      case userStatusInfo.SUSPENDED:
        return 'Contact support';
      case userStatusInfo.ACTIVE:
        return 'Completed';
      default:
        return 'Contact support';
    }
  }
}
