import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from'../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AuditLog } from '../schemas/auditlog.schema';

@Injectable()
export class AuditlogRepository extends AbstractRepository<AuditLog> {
  protected readonly logger = new Logger(AuditlogRepository.name);

  constructor(
    @InjectModel("auditlogs") auditlogModel: Model<AuditLog>,
    @InjectConnection() connection: Connection,
  ) {
    super(auditlogModel, connection);
  }
}
