import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Role } from '../../interfaces/role';
import { AuthZ } from '../authZ.decorator';
/**
 * @description ApiDescription adds description to the route
 */
export const Roles = (...roles: Role[]) =>
  applyDecorators(AuthZ(), ApiOperation({ summary: roles.join(' | ') || '' }));
