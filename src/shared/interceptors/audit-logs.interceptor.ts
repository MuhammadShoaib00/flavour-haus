import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { SwaggerService } from '../swagger.service';
import { map, Observable } from 'rxjs';
import { PermissionService } from '../../modules/user-account/services/permission.service';
import { AuditLogService } from '../../reference/audit.service';

@Injectable()
export class AuditLogsInterceptor implements NestInterceptor {
  constructor(
    private permissionService: PermissionService,
    private auditLogService: AuditLogService,
  ) {}
  protected readonly logger = new Logger(AuditLogsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (req.url.includes('undefined') || req.url.includes('null')) {
      throw new BadRequestException('Invalid Request URL.');
    }
    SwaggerService.setCurrentApiUrl(
      context.getClass().name,
      context.getHandler().name,
    );

    return next.handle().pipe(
      map(async (res) => {
        const controllerKey = context.getClass().name;
        const methodKey = context.getHandler().name;
        const eventId = `${controllerKey.replace('Controller', '')}.${
          methodKey.charAt(0).toUpperCase() + methodKey.slice(1)
        }`;
        let events = [];
        if (SwaggerService?._document?.paths == undefined) {
          return res;
        }
        Object.values(SwaggerService._document.paths).forEach((methods) => {
          Object.keys(methods).forEach((method) => {
            events.push({
              eventId: methods[method].operationId,
              description: methods[method].description || '',
            });
          });
        });
        const eventDateTime = new Date();
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip?.toString().replace('::ffff:', '');
        let data = {
          userId: req.user?.userId || res.data?.user?.userId || 'UNKNOWN',
          name:
            (req.user?.firstName && req.user?.lastName) || res.data?.user
              ? `${req.user?.firstName || res.data?.user?.firstName} ${
                  req.user?.lastName || res.data?.user?.lastName
                }`
              : 'UNKNOWN',
          role:
            req.user?.defaultRole ||
            res.data?.user?.defaultRole ||
            req.user?.roles[0] ||
            'UNKNOWN',
          status: 'ACTIVE',
          ipAddress: ip,
          eventName:
            events.find((e) => e.eventId === eventId)?.description || eventId,
          eventDate: eventDateTime.toLocaleDateString('en-UK'),
          eventTime: eventDateTime.toLocaleTimeString('en-UK'),
        };
        if (req.method.toUpperCase() != 'GET')
          await this.auditLogService.save_audit_log(data);

        if (
          SwaggerService._currentPermissionId ===
          `${controllerKey.replace('Controller', '')}.${
            methodKey.charAt(0).toUpperCase() + methodKey.slice(1)
          }`
        ) {
          await this.permissionService.updatePermissionDependency({
            permissionId: SwaggerService._currentPermissionId,
            dependencies: [...SwaggerService._currentPermissionDependencies],
          });
        }
        SwaggerService.resetApi();
        return res;
      }),
    );
  }
}
