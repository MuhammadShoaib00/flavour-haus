import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../modules/user-profile/services/user.service';

@Injectable()
export class AuthNGuard implements CanActivate {
  private readonly logger = new Logger('AuthNGuard');

  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<boolean>(
      'authenticatedOnly',
      context.getHandler(),
    );

    if (secured) {
      try {
        const token = this.getToken(context);
        this.logger.debug(`Token retrieved: ${token}`);

        const user = await this.userService.verifyToken({ token });

        this.appendUser({ ...user.data }, context);
      } catch (err) {
        this.logger.error('AuthNGuard error', err);
        if (err.failedAssertion) {
          throw new UnauthorizedException('Token expired.');
        }
        throw new UnauthorizedException(
          err?.message || 'Invalid or missing token.',
        );
      }
    }
    return true;
  }

  private getToken(context: ExecutionContext): string {
    let authorization: string | undefined;

    if (context.getType() === 'rpc') {
      authorization = context.switchToRpc().getData().authorization;
    } else if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      authorization = req.headers?.authorization;

      if (authorization && authorization.startsWith('Bearer ')) {
        authorization = authorization.slice(7);
      }
    }

    if (!authorization) {
      throw new UnauthorizedException('No authorization token provided.');
    }

    return authorization;
  }

  private appendUser(user: any, context: ExecutionContext): void {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
