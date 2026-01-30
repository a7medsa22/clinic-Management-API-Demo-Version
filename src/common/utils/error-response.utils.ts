export class ErrorResponseUtils {
  static formatValidationErrors(errors: any[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(
          ...Object.values(error.constraints).filter(
            (v): v is string => typeof v === 'string',
          ),
        );
      }

      if (error.children && error.children.length > 0) {
        messages.push(...this.formatValidationErrors(error.children));
      }
    }

    return messages;
  }

  static createErrorResponse(
    statusCode: number,
    error: string,
    message: string | string[],
  ) {
    return {
      success: false,
      statusCode,
      error,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
    };
  }
}
