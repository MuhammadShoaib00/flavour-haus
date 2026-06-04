import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { GetAllRightsResponse } from '../dto/user-rights/get-rights.dto';
import { AssignRightsDto, AssignRightsResponse } from '../dto/user-rights/assign-rights.dto';
import { PermissionService } from '../modules/user-account/services/permission.service';
import { UserService } from '../modules/user-profile/services/user.service';

@ApiTags('User Rights')
@Controller('user-rights')
export class UserRightController {
  protected readonly logger = new Logger(UserRightController.name);

  constructor(
    private permissionService: PermissionService,
    private userService: UserService,
  ) {}

  @Get(':userId')
  @ApiRoute.LIST({ name: 'All Rights', description: 'All User Rights', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: GetAllRightsResponse })
  @ApiParam({ type: String, name: 'userId', example: 'adeba046-4590-4728-82f2-ec03cdfeb7c6' })
  async getAllRights(@Param('userId') userId: string) {
    const user = await this.userService.getUserPermissions({ userId });
    const rights = await this.permissionService.getRights();

    if (user.userPermissions && user.userPermissions.length > 0) {
      const userPermissions = user.userPermissions;
      rights.forEach((right, index) => {
        userPermissions.find((permission) => {
          if (permission.permissionGroup == right.permissionGroup) {
            if (rights[index].permissions.list.allowed != undefined) {
              rights[index].permissions.list.allowed = permission?.permissions.list.allowed || false;
            }
            if (rights[index].permissions.update.allowed != undefined) {
              rights[index].permissions.update.allowed = permission?.permissions.update.allowed || false;
            }
            if (rights[index].permissions.delete.allowed != undefined) {
              rights[index].permissions.delete.allowed = permission?.permissions.delete.allowed || false;
            }
          }
        });
      });
    }
    return { data: rights, message: null, errors: null };
  }

  @Post()
  @ApiCreatedResponse({ type: AssignRightsResponse })
  @ApiRoute.UPDATE({ name: 'All Rights', description: 'All User Rights', roles: [Role.SYS_ADMIN] })
  async assignRights(@Body() dto: AssignRightsDto) {
    const rights = await this.userService.assignUserPermissions(dto);
    return { data: rights, message: null, errors: null };
  }
}
