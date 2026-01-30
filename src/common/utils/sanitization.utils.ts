export class SanitizationUtils {
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizeName(name: string): string {
    // Remove extra spaces and trim
    return name.trim().replace(/\s+/g, ' ');
  }

  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  static removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  static truncateText(
    text: string,
    maxLength: number,
    suffix: string = '...',
  ): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
}
