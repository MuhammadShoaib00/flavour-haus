import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Logger,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AssignPermissionRequestDto,
  AssignPermissionResponseDto,
  CreateRoleRequestDto,
  CreateRoleResponseDto,
  DeleteRoleResponseDto,
  GetRoleResponseDto,
  ListRolesResponseDto,
  RemovePermissionRequestDto,
  RemovePermissionResponseDto,
  UpdateRoleRequestDto,
} from '../dto/role';
import { Role } from '../shared/interfaces/role';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { RoleService } from '../modules/user-account/services/role.service';
import { PermissionService } from '../modules/user-account/services/permission.service';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  protected readonly logger = new Logger(RoleController.name);
  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
  ) {}

  @Post()
  @ApiRoute.UPDATE({
    name: 'Role',
    description: 'Created Role',
    roles: [Role.SYS_ADMIN],
  })
  @ApiCreatedResponse({ type: CreateRoleResponseDto })
  async create(@Body() dto: CreateRoleRequestDto) {
    return await this.roleService.createRole(dto);
  }

  @Get()
  @ApiRoute.LIST({
    name: 'Get Roles',
    description: 'Get All Roles',
    roles: [Role.SYS_ADMIN],
  })
  @ApiOkResponse({ type: ListRolesResponseDto })
  async list(@Query('limit') limit?: number) {
    return await this.roleService.listRoles({ limit });
  }

  @Get(':role')
  @ApiRoute.LIST({
    name: 'Get Role',
    description: 'Get Single Role',
    roles: [Role.SYS_ADMIN],
  })
  @ApiOkResponse({ type: GetRoleResponseDto })
  async get(@Param('role') role: string) {
    return await this.roleService.getRole({ role });
  }

  @Patch(':role')
  @ApiRoute.UPDATE({
    name: 'Role',
    description: 'Update Role',
    roles: [Role.SYS_ADMIN],
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: CreateRoleResponseDto })
  async update(@Param('role') role: string, @Body() dto: UpdateRoleRequestDto) {
    return await this.roleService.updateRole({ role, ...dto });
  }

  @Delete(':role')
  @ApiRoute.DELETE({
    name: 'Role',
    description: 'Delete Role',
    roles: [Role.SYS_ADMIN],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: DeleteRoleResponseDto })
  async delete(@Param('role') role: string) {
    return { data: null, message: 'Not implemented.', errors: null };
  }

  @Post('assign-permission')
  @ApiRoute.UPDATE({
    name: 'Permission to Role',
    description: 'Assigned Permission to a role',
    roles: [Role.SYS_ADMIN],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AssignPermissionResponseDto })
  async assignPermission(@Body() dto: AssignPermissionRequestDto) {
    return await this.permissionService.assignPermission(dto);
  }

  @Post('remove-permission')
  @ApiRoute.UPDATE({
    name: 'Permission to role',
    description: 'Remove Permission from a role',
    roles: [Role.SYS_ADMIN],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RemovePermissionResponseDto })
  async removePermission(@Body() dto: RemovePermissionRequestDto) {
    return await this.permissionService.removePermission(dto);
  }
}
