import { Injectable, Logger } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from '../schemas/permission.schema';
import _ from 'lodash';
import {
  AssignPermissionDto,
  CheckPermissionRolesDto,
  UpdatePermissionDependencyDto,
} from '../dto/permission';
import { RightRepository } from '../repositories/right.repository';
import { Right } from '../schemas/right.schema';

@Injectable()
export class PermissionService {
  constructor(private permissionRepository: PermissionRepository, private rightRepo: RightRepository) { }
  async addPermissions(document: any) {
    try {
      let ops: Permission[] = [];
      Object.keys(document.paths).forEach((route) => {
        let methods = document.paths[route];
        Object.keys(methods).forEach((method) => {
          ops.push({
            permissionId: methods[method].operationId,
            apiUrl: route,
            apiMethod: method.toUpperCase(),
            description: methods[method].description || '',
            allowedRoles:
              (methods[method]?.summary?.length !== 0 &&
                methods[method]?.summary?.split(' | ')) ||
              [],
          });
        });
      });
      const dbOpsWithIds = await this.permissionRepository.find();
      const dbOps = dbOpsWithIds.map((o) => {
        delete o._id;
        return o;
      });

      const newOps = _(ops).differenceWith(dbOps, _.isEqual).toJSON();
      const uniqueOps = _(ops).xorWith(dbOps, _.isEqual).toJSON();
      const oldOps = _(uniqueOps).differenceWith(newOps, _.isEqual).toJSON();

      const isUpdated = !_(newOps).isEmpty();
      if (dbOpsWithIds.length === 0 || !!isUpdated) {
        if (dbOpsWithIds.length > 0) {
          oldOps.map((o) => {
            let newOp = newOps.find((nO) => nO.permissionId === o.permissionId);
            if (newOp) {
              newOp.dependencies = o.dependencies;
            }
          })
          await this.permissionRepository.deleteMany(
            {},
            oldOps.map((o) => o.permissionId),
            'permissionId',
          );
        }
        await this.permissionRepository.createMany(newOps, {
          ordered: true,
        });
      }
    } catch (err) {
      throw err;
    }
  }

  async addRights(document: any) {
    try {
      let ops: Right[] = [];
      let groups: any = [];
      
      await this.rightRepo.removeMany({});
      Object.keys(document.paths).forEach((route) => {
        let methods = document.paths[route];
        // let permissionMethods: any = [];
        // Object.keys(methods).forEach((method) => {
        //   if(methods[method]['permission']){
        //     const operation = (methods[method].operationId.split('.'))[1] || '';
        //     permissionMethods.push(operation);
        //   }
        // });
        Object.keys(methods).forEach((method) => {
          if(methods[method]['permission']){
            const tag = methods[method]['tags'][0] || "";
            if(!groups.includes(tag)){
              ops.push({
                permissionName: tag || "Misc",
                permissionMethods: [],
                permissionGroup: (methods[method].operationId).split('.')[0] || 'Misc',
                permissions: {
                  list: {
                    allowed: false,
                    message: `View ${tag} details`,
                  },
                  update: {
                    allowed: false,
                    message: `Add/Edit ${tag} details`,
                  },
                  delete: {
                    allowed: false,
                    message: `Delete ${tag} details`,
                  }
                },
              });
            }
            groups.push(tag);
          }
        });
      });
      await this.rightRepo.createMany(ops, {
        ordered: true,
      });
    } catch (err) {
      throw err;
    }
  }

  async getRights(){
    try {
      return await this.rightRepo.find({}, { permissionMethods: 0 }, {
        sort: {permissionName: 1}
      });
    } catch (err) {
      throw err;
    }
  }

  async getPermissions() {
    try {
      return await this.permissionRepository.find({}, { _id: 0 });
    } catch (err) {
      throw err;
    }
  }

  async getPermissionsByRole(dto: { role: string }) {
    try {
      const { role } = dto;
      const permissions = await this.permissionRepository.find(
        { allowedRoles: role },
        { _id: 0 },
      );
      return {
        data: permissions,
        message: 'Removed permission for the role.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async updatePermissionDependency({
    permissionId,
    dependencies,
  }: UpdatePermissionDependencyDto) {
    try {
      const permission = await this.permissionRepository.findOne({ permissionId });
      if (permission.dependencies.length === 0 || permission.dependencies.length < dependencies.length) {
        return await this.permissionRepository.findOneAndUpdate(
          { permissionId },
          {
            $set: {
              dependencies: [...dependencies],
            },
          },
        );
      }
      return false
    } catch (err) {
      throw err;
    }
  }

  async assignPermission(dto: AssignPermissionDto) {
    try {
      const { permissionId, role } = dto;
      await this.permissionRepository.findOneAndUpdate(
        { permissionId },
        {
          $push: { allowedRoles: role },
        },
      );
      return {
        data: null,
        message: 'Assigned permission for the role.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async removePermission(dto: AssignPermissionDto) {
    try {
      const { permissionId, role } = dto;
      await this.permissionRepository.findOneAndUpdate(
        { permissionId },
        {
          $pull: { allowedRoles: role },
        },
      );
      return {
        data: null,
        message: 'Removed permission for the role.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async checkPermissionRoles({
    controllerKey,
    methodKey,
  }: CheckPermissionRolesDto) {
    try {
      const { allowedRoles } = await this.permissionRepository.findOne({
        permissionId: `${controllerKey.replace('Controller', '')}.${methodKey.charAt(0).toUpperCase() + methodKey.slice(1)
          }`,
      });
      return {
        data: {
          allowedRoles,
        },
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }
}

