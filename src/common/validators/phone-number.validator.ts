import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsEgyptianPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEgyptianPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Egyptian phone number patterns
          const patterns = [
            /^\+20(10|11|12|15)\d{8}$/, // Mobile with country code
            /^(010|011|012|015)\d{8}$/, // Mobile without country code
            /^\+20(2)\d{8}$/, // Landline with country code (Cairo)
            /^(02)\d{8}$/, // Landline without country code (Cairo)
            /^\+20(3|40|45|46|47|48|50|55|57|62|64|65|66|68|69|82|84|86|88|92|93|95|96|97)\d{7}$/, // Other governorates
          ];

          return patterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid Egyptian phone number format';
        },
      },
    });
  };
}
