import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';

@Injectable()
export class CheckVeriffSignatureGuard implements CanActivate {
  private readonly logger = new Logger(CheckVeriffSignatureGuard.name);
  constructor(
    private reflector: Reflector,
    private config: ConfigService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const checkSignature = this.reflector.get<boolean>(
      'checkVeriffSignature',
      context.getHandler(),
    );

    if (checkSignature) {
      try {
        let payload = context.switchToHttp().getRequest()?.body;
        const signature = context.switchToHttp().getRequest().get('x-hmac-signature');
        if (payload.constructor === Object) {
          payload = JSON.stringify(payload);
        }
        if (payload.constructor !== Buffer) {
          payload = Buffer.from(payload, 'utf8');
        }
        const digest = crypto
          .createHmac('sha256', this.config.get('VERIFF_PRIVATE_API_KEY'))
          .update(Buffer.from(payload, 'utf8'))
          .digest('hex')
          .toLowerCase();
          
        return digest === signature.toLowerCase();

      } catch (err) {
        throw new ForbiddenException(err);
      }
    }
    return true;
  }
}
