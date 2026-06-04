import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Backup } from '../schemas/backup.schema';

@Injectable()
export class BackupRepository extends AbstractRepository<Backup> {
  protected readonly logger = new Logger(BackupRepository.name);
  constructor(
    @InjectModel(Backup.name) backupModel: Model<Backup>,
    @InjectConnection() connection: Connection,
  ) {
    super(backupModel, connection);
  }
}
