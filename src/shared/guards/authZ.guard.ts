import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../modules/user-account/services/permission.service';
import { UserService } from '../../modules/user-profile/services/user.service';
import { Role } from '../interfaces/role';
import { HostNotConfirmed } from '../exceptions/host-not-confirmed.exception';

@Injectable()
export class AuthZGuard implements CanActivate {
  private readonly logger = new Logger('AuthZGuard');
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authorizedOnly = this.reflector.get<boolean>(
      'authorizedOnly',
      context.getHandler(),
    );

    const CheckHostNotConfirmed = this.reflector.get<boolean>(
      'withoutConfirmation',
      context.getHandler(),
    );

    const CheckHostConfirmed = this.reflector.get<boolean>(
      'requireConfirmation',
      context.getHandler(),
    );

    if (!authorizedOnly) {
      return true;
    }
    const controllerKey = context.getClass().name;
    const methodKey = context.getHandler().name;
    try {
      const userRoles = context.switchToHttp().getRequest()?.user?.roles;
      const { data } = await this.permissionService.checkPermissionRoles({
        controllerKey,
        methodKey,
      });

      const allowed = userRoles?.filter((role: string) =>
        data.allowedRoles.includes(role),
      ).length;

      if (!allowed)
        throw new Error('You are not authorized to access this route');

      const user = context.switchToHttp().getRequest()?.user;
      const { data: userProfile } = await this.userService.getUserForAuth({
        userId: user.userId,
      });

      let routeType = this.reflector.get('routeType', context.getHandler());

      if (
        routeType != undefined &&
        routeType != null &&
        userProfile.userPermissions &&
        userProfile.userPermissions.length > 0
      ) {
        const controllerName = controllerKey.replace('Controller', '');
        const userPermissions = userProfile.userPermissions;
        const permission = userPermissions.find(
          (o) => o.permissionGroup === controllerName,
        );
        const permissionAllowed =
          permission?.permissions[routeType]?.allowed || false;

        if (
          permissionAllowed == undefined ||
          permissionAllowed == null ||
          !permissionAllowed
        ) {
          throw Error('You dont have a permission to access this route');
        }
      }

      if (
        CheckHostNotConfirmed === undefined ||
        CheckHostNotConfirmed === false
      ) {
        this.checkIfHostConfirmed(userProfile, userRoles);
      }

      if (CheckHostConfirmed === true) {
        this.checkIfHostActuallyConfirmed(userProfile, userRoles);
      }

      context.switchToHttp().getRequest().user = { ...user, ...userProfile };
      return true;
    } catch (err) {
      throw new ForbiddenException(err.message);
    }
  }

  private checkIfHostConfirmed(user, userRoles) {
    if (
      userRoles.includes(Role.HOST) &&
      !user.isEligibleForAudit &&
      user.isEligibleForAudit !== undefined
    ) {
      throw new HostNotConfirmed(
        'Your host account is not confirmed please update your profile completely to have access to the system',
      );
    }
  }

  private checkIfHostActuallyConfirmed(user, userRoles) {
    if (
      userRoles.includes(Role.HOST) &&
      !user.isHostConfirmed &&
      user.isHostConfirmed !== undefined
    ) {
      throw new HostNotConfirmed(
        'Your host account is not confirmed please wait unless your initial audit is done',
      );
    }
  }
}
