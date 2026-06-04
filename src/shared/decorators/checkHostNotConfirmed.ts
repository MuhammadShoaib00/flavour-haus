import { applyDecorators, SetMetadata } from '@nestjs/common';
/**
 * @description AuthZ is used for Role-based Authorization
 */
export const CheckHostNotConfirmed = () => {
  return applyDecorators(SetMetadata('withoutConfirmation', true));
};
