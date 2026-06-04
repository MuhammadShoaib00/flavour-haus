import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAuditLogSchema } from '../shared/interfaces/reference_data/schemas/audit_log.schema ';

export class AuditLogService {
  constructor(
    @InjectModel('AuditLog')
    private readonly auditModel: Model<IAuditLogSchema>,
  ) {}

  public async save_audit_log(data): Promise<any> {
    const ribbons_badges = await this.auditModel.create(data);
  }

}

