export class ValidationUtils {
  static isValidEgyptianNationalId(nationalId: string): boolean {
    if (
      !nationalId ||
      nationalId.length !== 14 ||
      !/^\d{14}$/.test(nationalId)
    ) {
      return false;
    }

    // Century validation
    const centuryDigit = parseInt(nationalId[0]);
    if (centuryDigit !== 2 && centuryDigit !== 3) return false;

    // Date validation
    const year = parseInt(nationalId.substring(1, 3));
    const month = parseInt(nationalId.substring(3, 5));
    const day = parseInt(nationalId.substring(5, 7));

    if (month < 1 || month > 12 || day < 1 || day > 31) return false;

    // Governorate code validation
    const govCode = parseInt(nationalId.substring(7, 9));
    if (govCode < 1 || govCode > 35) return false;

    return true;
  }

  static isValidEgyptianPhone(phone: string): boolean {
    const patterns = [
      /^\+20(10|11|12|15)\d{8}$/, // Mobile with country code
      /^(010|011|012|015)\d{8}$/, // Mobile without country code
      /^\+20(2)\d{8}$/, // Landline with country code
      /^(02)\d{8}$/, // Landline without country code
    ];

    return patterns.some((pattern) => pattern.test(phone));
  }

  static normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // If starts with 20, add +
    if (normalized.startsWith('20') && !normalized.startsWith('+20')) {
      normalized = '+' + normalized;
    }

    // If starts with 0 and is 11 digits, add +20
    if (normalized.startsWith('0') && normalized.length === 11) {
      normalized = '+20' + normalized.substring(1);
    }

    // If no country code and starts with 1, add +20
    if (normalized.match(/^1[0-5]\d{8}$/)) {
      normalized = '+20' + normalized;
    }

    return normalized;
  }

  static extractBirthDateFromNationalId(nationalId: string): Date | null {
    if (!this.isValidEgyptianNationalId(nationalId)) {
      return null;
    }

    const centuryDigit = parseInt(nationalId[0]);
    const yearSuffix = parseInt(nationalId.substring(1, 3));
    const month = parseInt(nationalId.substring(3, 5));
    const day = parseInt(nationalId.substring(5, 7));

    // Determine full year
    const century = centuryDigit === 2 ? 1900 : 2000;
    const fullYear = century + yearSuffix;

    return new Date(fullYear, month - 1, day);
  }

  static extractGenderFromNationalId(
    nationalId: string,
  ): 'Male' | 'Female' | null {
    if (!this.isValidEgyptianNationalId(nationalId)) {
      return null;
    }

    // 13th digit determines gender (odd = male, even = female)
    const genderDigit = parseInt(nationalId[12]);
    return genderDigit % 2 === 0 ? 'Female' : 'Male';
  }

  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) return data;
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }

  static validateAge(
    birthDate: Date,
    minAge: number = 0,
    maxAge: number = 150,
  ): boolean {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= minAge && age - 1 <= maxAge;
    }

    return age >= minAge && age <= maxAge;
  }
}
