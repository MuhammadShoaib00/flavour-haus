import { applyDecorators, SetMetadata } from '@nestjs/common';
/**
 * @description AuthZ is used for Role-based Authorization
 */
export const CheckHostConfirmed = () => {
  return applyDecorators(SetMetadata('requireConfirmation', true));
};
