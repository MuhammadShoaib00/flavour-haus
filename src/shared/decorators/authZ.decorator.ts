import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AuthN } from './authN.decorator';
/**
 * @description AuthZ is used for Role-based Authorization
 */
export const AuthZ = (type?: string) =>
  applyDecorators(AuthN(), SetMetadata('routeType', type), SetMetadata('authorizedOnly', true));
