import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDescription } from '../shared/decorators/custom';
import { PermissionService } from '../modules/user-account/services/permission.service';

@ApiTags('Permissions')
@Controller('permission')
export class PermissionController {
  protected readonly logger = new Logger(PermissionController.name);
  constructor(private permissionService: PermissionService) {}

  @Get('list')
  @ApiDescription('Get Permissions')
  @ApiQuery({ name: 'role', required: false })
  async list(@Query('role') role?: string) {
    if (!role) {
      return await this.permissionService.getPermissions();
    } else {
      return await this.permissionService.getPermissionsByRole({ role });
    }
  }
}
