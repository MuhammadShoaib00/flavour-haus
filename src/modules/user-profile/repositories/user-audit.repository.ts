import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { UserAudit } from '../schemas/user_audit.schema';

@Injectable()
export class UserAuditRepository extends AbstractRepository<UserAudit> {
  protected readonly logger = new Logger(UserAuditRepository.name);

  constructor(
    @InjectModel(UserAudit.name)
    userAuditModel: Model<UserAudit>,
    @InjectConnection() connection: Connection,
  ) {
    super(userAuditModel, connection);
  }

  async getAssignedAudits(auditorId: string, offset: number, limit: number) {
    const filterQuery = { auditorId: auditorId };
    const pipelines = [
      { $project: { timeLine: 0 } },
      { $match: { auditorId: auditorId } },
      {
        $lookup: {
          from: 'kitchens',
          let: { kitchenId: '$kitchenId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$kitchenId'] } } },
            { $project: { name: 1, location: 1 } },
          ],
          as: 'kitchen',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { hostId: '$hostId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$hostId'] } } },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                kitchen: 1,
                profileImage: 1,
                address: 1,
                city: 1,
                gender: 1,
                language: 1,
              },
            },
          ],
          as: 'host',
        },
      },
      { $unwind: { path: '$kitchen' } },
      { $unwind: { path: '$host' } },
    ];
    return await this.paginate({
      filterQuery,
      pipelines: pipelines,
      returnKey: 'audits',
      offset,
      limit,
    });
  }

  async getDashboardData(userId: string) {
    const yearStart = new Date().getFullYear() + '-01-01';
    const query = [
      {
        $match: { auditorId: userId, createdAt: { $gte: new Date(yearStart) } },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    return await this.aggregate(query);
  }
}
