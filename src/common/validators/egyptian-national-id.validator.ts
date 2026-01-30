import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsEgyptianNationalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEgyptianNationalId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          if (value.length !== 14) return false;
          if (!/^\d{14}$/.test(value)) return false;

          // Validate Egyptian National ID format
          // First digit should be 2 or 3 (for birth years 19xx or 20xx)
          const centuryDigit = parseInt(value[0]);
          if (centuryDigit !== 2 && centuryDigit !== 3) return false;

          // Extract birth date (YYMMDD)
          const year = parseInt(value.substring(1, 3));
          const month = parseInt(value.substring(3, 5));
          const day = parseInt(value.substring(5, 7));

          // Validate month (01-12)
          if (month < 1 || month > 12) return false;

          // Validate day (01-31)
          if (day < 1 || day > 31) return false;

          // Governorate code (positions 8-9)
          const govCode = parseInt(value.substring(7, 9));
          if (govCode < 1 || govCode > 35) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid Egyptian National ID format';
        },
      },
    });
  };
}
