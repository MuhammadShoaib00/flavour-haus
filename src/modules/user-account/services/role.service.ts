import { Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto, GetRoleDto, UpdateRoleDto, ListRolesDto } from '../dto/role';

const STATIC_ROLES = [
  { role: 'SYS_ADMIN', precedence: 1, description: 'System Administrator' },
  { role: 'CMP_OFFICER', precedence: 2, description: 'Compliance Officer' },
  { role: 'HOST', precedence: 3, description: 'Host / Kitchen Operator' },
  { role: 'GUEST', precedence: 4, description: 'Guest / Customer' },
];

@Injectable()
export class RoleService {
  protected readonly logger = new Logger(RoleService.name);

  async listRoles(_dto: ListRolesDto) {
    try {
      return { data: STATIC_ROLES.map((r) => ({ ...r, createdAt: null, updatedAt: null })), message: '', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async getRole({ role }: GetRoleDto) {
    try {
      const found = STATIC_ROLES.find((r) => r.role === role);
      if (!found) throw new Error(`Role '${role}' not found.`);
      return { data: { ...found, createdAt: null, updatedAt: null }, message: '', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async createRole({ role, precedence, description }: CreateRoleDto) {
    try {
      return { data: { role, precedence, description, createdAt: null, updatedAt: null }, message: 'Role created successfully.', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async updateRole({ role, precedence, description }: UpdateRoleDto) {
    try {
      return { data: { role, precedence, description, createdAt: null, updatedAt: null }, message: 'Role updated successfully.', errors: null };
    } catch (err) {
      throw err;
    }
  }
}

