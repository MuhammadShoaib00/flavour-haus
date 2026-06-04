import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User } from '../schemas/user.schema';
import {
  UserAuditStatusEnum,
  UserAuditTypeEnum,
} from '../interfaces/user-audit.enum';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  private async auditQuery(filters: any) {
    const query = [
      { $match: filters },
      {
        $lookup: {
          from: 'kitchens',
          let: { user_id: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$user_id'] } } },
            { $project: { name: 1, location: 1 } },
          ],
          as: 'kitchen',
        },
      },
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
      { $unwind: { path: '$kitchen' } },
    ];
    return await this.aggregate(query);
  }

  async getHostsForInitalAudit({
    host_role,
    host,
    officer,
    location,
    createdAt,
    status,
    limit,
    offset,
  }) {
    let searchQuery: any = [{ _id: { $exists: true } }];
    let auditFilter: any = [];

    if (host != null && host != '') {
      searchQuery.push({
        firstName: { $regex: host.toLowerCase(), $options: 'i' },
      });
      searchQuery.push({
        lastName: { $regex: host.toLowerCase(), $options: 'i' },
      });
    }

    if (location != null && location != '') {
      searchQuery.push({
        city: { $regex: location.toLowerCase(), $options: 'i' },
      });
      searchQuery.push({
        address: { $regex: location.toLowerCase(), $options: 'i' },
      });
    }

    if (officer != null && officer != '') {
      auditFilter.push({ $eq: ['$auditorId', officer] });
    }

    if (
      status != null &&
      status != '' &&
      status != UserAuditStatusEnum.UNASSIGNED
    ) {
      auditFilter.push({ $eq: ['$status', status] });
    }

    if (createdAt != null && createdAt != '') {
      auditFilter.push({
        $gte: ['$createdAt', new Date(createdAt + 'T00:00:00')],
      });
      auditFilter.push({
        $lt: ['$createdAt', new Date(createdAt + 'T23:59:59')],
      });
    }

    let filters: any = {
      $and: [
        { $or: searchQuery },
        // {isEligibleForAudit: { $in: [null, true] }},
        // {isHostConfirmed: { $in: [null, false] }},
        // {isAssignedForAudit: { $in: [null, false] }},
        { defaultRole: host_role },
      ],
    };

    const query = [
      {
        $lookup: {
          from: 'kitchens',
          let: { user_id: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$user_id'] } } },
            { $project: { name: 1, location: 1 } },
          ],
          as: 'kitchen',
        },
      },
      {
        $lookup: {
          from: 'user_audits',
          let: { user_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$auditType', UserAuditTypeEnum.INITIAL_VISIT] },
                    { $eq: ['$hostId', '$$user_id'] },
                    ...auditFilter,
                  ],
                },
              },
            },
            {
              $project: {
                status: 1,
                auditType: 1,
                hostId: 1,
              },
            },
          ],
          as: 'audit',
        },
      },
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
          audit: 1,
        },
      },
      { $unwind: { path: '$kitchen' } },
      { $unwind: { path: '$audit', preserveNullAndEmptyArrays: true } },
    ];
    return await this.paginate({
      filterQuery: filters,
      offset,
      limit,
      returnKey: 'hosts',
      pipelines: query,
    });
  }

  async getHostsForAdditionalAudit(hostRole: string) {
    const filters = { defaultRole: hostRole };
    return await this.auditQuery(filters);
  }

  async getCmpOfficersForAudit(cmpRole: string, newFilters?: Object) {
    const filters = { defaultRole: cmpRole, ...newFilters };
    const projection = { _id: 1, firstName: 1, lastName: 1 };
    // const projection = { _id: 1, profileImage: 0, firstName: 1, lastName: 1, address: 1, city: 1, language: 1, gender: 1 };
    return await this.find(filters, projection);
  }

  async adminListUsers(filterQuery: Array<any>, limit: number, offset: number){
    return await this.paginate({
      filterQuery, limit, offset, returnKey: "users", pipelines: [
        {
          $project: {
            "license": 0, 
            "dbsCheck": 0, 
            "profileCompletion" : 0, 
            "contractBookData": 0,
            "isAssignedForAudit": 0,
            "isEligibleForAudit": 0,
            "isDBSConfirmed" : 0,
            "isIdVerified" : 0,
            "userPermissions": 0,
          }
        }
      ]
    });
  }
}
