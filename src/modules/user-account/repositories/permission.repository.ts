import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Permission } from '../schemas/permission.schema';

@Injectable()
export class PermissionRepository extends AbstractRepository<Permission> {
  protected readonly logger = new Logger(PermissionRepository.name);

  constructor(
    @InjectModel(Permission.name) permissionModel: Model<Permission>,
    @InjectConnection() connection: Connection,
  ) {
    super(permissionModel, connection);
  }
}
