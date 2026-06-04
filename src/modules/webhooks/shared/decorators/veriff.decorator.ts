import { applyDecorators, SetMetadata } from '@nestjs/common';
/**
 * @description Veriff is used for HMAC Signature Verification
 */
export const Veriff = () =>
  applyDecorators(SetMetadata('checkVeriffSignature', true));
