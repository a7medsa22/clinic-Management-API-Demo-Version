export class PasswordUtils {
  static calculateStrength(password: string): {
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length < 8)
      feedback.push('Password should be at least 8 characters');

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Add special characters (@$!%*?&)');

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeating characters');
    }

    if (/^(123|abc|password|qwerty)/i.test(password)) {
      score -= 2;
      feedback.push('Avoid common patterns');
    }

    // Determine strength
    let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'fair';
    else if (score <= 6) strength = 'good';
    else if (score <= 7) strength = 'strong';
    else strength = 'very-strong';

    return { score, strength, feedback };
  }

  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'monkey',
      '1234567890',
      'letmein',
      'trustno1',
      'dragon',
      'baseball',
      'iloveyou',
      'master',
      'sunshine',
      'ashley',
      'bailey',
      'passw0rd',
      'shadow',
      '123123',
      '654321',
    ];
    return commonPasswords.includes(password.toLowerCase());
  }
}
