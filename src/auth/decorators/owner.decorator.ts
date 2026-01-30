import { SetMetadata } from '@nestjs/common';

export const OWNER_KEY = 'owner_key';

export const Owner = (paramName: string) => SetMetadata(OWNER_KEY, paramName);
