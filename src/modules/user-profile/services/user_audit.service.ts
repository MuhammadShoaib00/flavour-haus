import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserAuditRepository } from '../repositories/user-audit.repository';
import {
  UserAuditStatusEnum,
  UserAuditTypeEnum,
} from '../interfaces/user-audit.enum';
import { Types } from 'mongoose';

@Injectable()
export class UserAuditService {
  constructor(
    private userRepo: UserRepository,
    private userAuditRepo: UserAuditRepository,
  ) {}

  async getAssignableAudits(payload: {
    assigned?: string;
    limit: number;
    search: string;
    offset: number;
    auditType: UserAuditTypeEnum;
    hostId: string;
    auditorId: string;
    createdAt: Date;
    latitude: number;
    longitude: number;
    status?: UserAuditStatusEnum | string;
  }) {
    try {
      const {
        assigned,
        limit,
        offset,
        auditType,
        search,
        status,
        hostId,
        latitude,
        longitude,
        auditorId,
        createdAt,
      } = payload;
      let optionalQuery = [
        ...(hostId
          ? [
              {
                hostId: hostId,
              },
            ]
          : []),
        ...(auditorId
          ? [
              {
                auditorId: auditorId,
              },
            ]
          : []),
        ...(status && status != 'All'
          ? [
              {
                status: status,
              },
            ]
          : []),
        ...(search
          ? [
              {
                hostName: { $regex: search.toLowerCase(), $options: 'i' },
              },
              {
                kitchenName: { $regex: search.toLowerCase(), $options: 'i' },
              },
              {
                auditorName: { $regex: search.toLowerCase(), $options: 'i' },
              },
            ]
          : []),
      ];
      const data = await this.userAuditRepo.paginate({
        topPipelines: [
          ...(createdAt
            ? [
                {
                  $addFields: {
                    value: {
                      $ifNull: [
                        {
                          $last: '$timeLine.date',
                        },
                        '$createdAt',
                      ],
                    },
                  },
                },
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $eq: [
                            new Date(createdAt).toISOString().slice(0, 10),
                            {
                              $dateToString: {
                                date: '$createdAt',
                                format: '%Y-%m-%d',
                              },
                            },
                          ],
                        },
                        {
                          $eq: [
                            new Date(createdAt).toISOString().slice(0, 10),
                            {
                              $dateToString: {
                                date: '$value',
                                format: '%Y-%m-%d',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              ]
            : []),
          ...(!!latitude && !!longitude
            ? [
                {
                  $geoNear: {
                    near: {
                      type: 'Point',
                      coordinates: [Number(longitude), Number(latitude)],
                    },
                    distanceField: 'distance',
                    maxDistance: 100,
                  },
                },
              ]
            : []),
        ],
        filterQuery: {
          auditType,
          ...(optionalQuery.length != 0 && { $or: optionalQuery }),
          ...(assigned == 'false' && {
            auditType: null,
            status: UserAuditStatusEnum.UNASSIGNED,
          }),
        },
        pipelines: [
          {
            $project: {
              value: 0,
            },
          },
        ],
        returnKey: 'audits',
        limit,
        offset,
      });
      return {
        data,
        message: 'Got Audits for Admin.',
        errors: null,
      };
      // let filter = {
      //   filterQuery: {
      //     auditType,
      //     ...(createdAt && {
      //       // $expr: {
      //       //   $eq: [
      //       //     new Date(createdAt).toISOString().slice(0, 10),
      //       //     { $dateToString: { date: '$value', format: '%Y-%m-%d' } },
      //       //   ],
      //       // },
      //       createdAt: {
      //         $gte: new Date(today.toLocaleString().slice(0, 8)),
      //         $lt: new Date(today.setDate(today.getDate() + 1)),
      //       },
      //     }),
      //     $and: [
      //       // ...(hostId != undefined ? [
      //       //   {
      //       //     // hostId: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1',
      //       //     hostId,
      //       //   },
      //       // ]: [{}]),
      //       // ...(auditorId != undefined ? [
      //       //   {
      //       //     // auditorId: '35121b85-6005-473d-afb9-1f3e3e3f42c1',
      //       //     auditorId
      //       //   },
      //       // ]: [{}]),
      //       // ...(status != undefined ? [
      //       //   {
      //       //     // status: 'In Progress',
      //       //     status
      //       //   },
      //       // ]: [{}]),
      //       // ...(search != undefined ? [
      //       //   {
      //       //     hostName: { $regex: search.toLowerCase(), $options: 'i' },
      //       //   },
      //       //   {
      //       //     kitchenName: { $regex: search.toLowerCase(), $options: 'i' },
      //       //   },
      //       //   {
      //       //     auditorName: { $regex: search.toLowerCase(), $options: 'i' },
      //       //   },
      //       // ]: [{}]),
      //     ],
      //     ...(assigned == 'false' && {
      //       auditType: null,
      //       status: UserAuditStatusEnum.UNASSIGNED,
      //     }),
      //   },
      //   returnKey: 'audits',
      //   limit,
      //   offset,
      //   topPipelines:
      //     payload.longitude && payload.latitude
      //       ? [
      //           {
      //             $geoNear: {
      //               near: {
      //                 type: 'Point',
      //                 coordinates: [
      //                   Number(payload.longitude),
      //                   Number(payload.latitude),
      //                 ],
      //               },
      //               distanceField: 'distance',
      //               maxDistance: 0,
      //             },
      //           },
      //         ]
      //       : [],
      // };
      // if (hostId) filter.filterQuery.$and.push({ hostId });
      // if (auditorId) filter.filterQuery.$and.push({ auditorId });
      // if (status && status !== 'All') filter.filterQuery.$and.push({ status });
      // if (search)
      //   filter.filterQuery.$and.push(
      //     {
      //       hostName: { $regex: search.toLowerCase(), $options: 'i' },
      //     },
      //     {
      //       kitchenName: { $regex: search.toLowerCase(), $options: 'i' },
      //     },
      //     {
      //       auditorName: { $regex: search.toLowerCase(), $options: 'i' },
      //     },
      //   );
      // if (filter.filterQuery.$and.length === 0) delete filter.filterQuery.$and;
      // const data = await this.userAuditRepo.paginate(filter);
      // return {
      //   data,
      //   message: 'Got Audits for Admin.',
      //   errors: null,
      // };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getHosts({
    auditType,
    search,
  }: {
    auditType?: UserAuditTypeEnum;
    search?: string;
  }) {
    try {
      const hosts = await this.userAuditRepo.find(
        {
          $or: [
            {
              ...(search && {
                hostName: { $regex: search.toLowerCase(), $options: 'i' },
              }),
            },
          ],
          auditType:
            !auditType || auditType == UserAuditTypeEnum.INITIAL_VISIT
              ? null
              : UserAuditTypeEnum.INITIAL_VISIT,
          ...(!auditType || auditType == UserAuditTypeEnum.INITIAL_VISIT
            ? {
                status: 'Unassigned',
              }
            : {
                status: 'Completed',
              }),
        },
        { _id: 0, auditId: '$_id', hostName: 1 },
      );
      return {
        data: [...hosts],
        message: 'Got Hosts',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getCmpOfficers(payload: { cmp_role: string; search: string }) {
    try {
      const { cmp_role, search } = payload;
      const complianceOfficers = await this.userRepo.getCmpOfficersForAudit(
        cmp_role,
        {
          ...(search && {
            $or: [
              {
                firstName: { $regex: search.toLowerCase(), $options: 'i' },
              },
              {
                lastName: { $regex: search.toLowerCase(), $options: 'i' },
              },
            ],
          }),
        },
      );
      return {
        complianceOfficers,
      };
    } catch (err) {
      throw err;
    }
  }

  async getAssignAudits(payload: {
    cmp_role: string;
    host_role: string;
    isAdditional: string;
  }) {
    try {
      const { cmp_role, host_role, isAdditional } = payload;
      let hosts = [];
      if (isAdditional == 'true') {
        hosts = await this.userRepo.getHostsForAdditionalAudit(host_role);
      } else {
        // hosts = await this.userRepo.getHostsForInitalAudit(host_role);
      }
      const complianceOfficers = await this.userRepo.getCmpOfficersForAudit(
        cmp_role,
      );
      return {
        hosts,
        complianceOfficers,
      };
    } catch (err) {
      throw err;
    }
  }

  async assignAudit(payload: {
    kitchenId: Types.ObjectId;
    kitchenName: string;
    hostId: string;
    hostName: string;
    hostProfileImage: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  }) {
    try {
      const {
        hostId,
        hostName,
        hostProfileImage,
        kitchenId,
        kitchenName,
        address,
        city,
        country,
        latitude,
        longitude,
      } = payload;
      const audit = await this.userAuditRepo.create({
        kitchenId,
        kitchenName,
        hostId,
        hostName,
        hostProfileImage,
        location: {
          address,
          city,
          country,
          latitude,
          longitude,
        },
        loc: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      });
      await this.userRepo.findOneAndUpdate(
        { _id: hostId },
        { $set: { isAssignedForAudit: true } },
      );
      return audit;
    } catch (err) {
      throw err;
    }
  }

  async assignAudits(payload: {
    auditIds: string[];
    auditorId: string;
    auditType: string;
    dueDate: string | Date;
  }) {
    try {
      const { auditIds, auditorId, auditType, dueDate } = payload;
      const { firstName, lastName } = await this.userRepo.findOne(
        { _id: auditorId },
        { _id: 1, firstName: 1, lastName: 1 },
      );
      let checkAudits = [];
      let updatedAudits = [];

      if (auditType == UserAuditTypeEnum.INITIAL_VISIT) {
        checkAudits = await this.userAuditRepo.find(
          {
            _id: { $in: auditIds.map((id) => new Types.ObjectId(id)) },
            auditType: null,
          },
          { _id: 1, hostId: 1 },
        );

        updatedAudits = await this.userAuditRepo.updateMany(
          {
            _id: { $in: auditIds.map((id) => new Types.ObjectId(id)) },
          },
          {
            $set: {
              auditorId,
              auditorName: `${firstName} ${lastName}`,
              auditType: UserAuditTypeEnum.INITIAL_VISIT,
              dueDate: new Date(dueDate),
              timeLine: [
                { status: UserAuditStatusEnum.ASSIGNED, date: new Date() },
              ],
              status: UserAuditStatusEnum.ASSIGNED,
            },
          },
        );
      } else if (auditType == UserAuditTypeEnum.ANNOUNCED_VISIT) {
        checkAudits = await this.userAuditRepo.find({
          _id: { $in: auditIds.map((id) => new Types.ObjectId(id)) },
          auditType: UserAuditTypeEnum.INITIAL_VISIT,
        });

        updatedAudits = await this.userAuditRepo.createMany(
          checkAudits.map((audit) => {
            let { _id, message, ...auditData } = audit;
            return {
              ...auditData,
              auditorId,
              auditorName: `${firstName} ${lastName}`,
              auditType: UserAuditTypeEnum.ANNOUNCED_VISIT,
              dueDate: new Date(dueDate),
              timeLine: [
                { status: UserAuditStatusEnum.ASSIGNED, date: new Date() },
              ],
              status: UserAuditStatusEnum.ASSIGNED,
            };
          }),
        );
      } else if (auditType == UserAuditTypeEnum.UNANNOUNCED_VISIT) {
        checkAudits = await this.userAuditRepo.find({
          _id: { $in: auditIds },
          auditType: UserAuditTypeEnum.INITIAL_VISIT,
        });

        updatedAudits = await this.userAuditRepo.createMany(
          checkAudits.map((audit) => {
            let { _id, message, ...auditData } = audit;
            return {
              ...auditData,
              auditorId,
              auditorName: `${firstName} ${lastName}`,
              auditType: UserAuditTypeEnum.UNANNOUNCED_VISIT,
              dueDate: new Date(dueDate),
              timeLine: [
                { status: UserAuditStatusEnum.ASSIGNED, date: new Date() },
              ],
              status: UserAuditStatusEnum.ASSIGNED,
            };
          }),
        );
      }
      if (auditType == UserAuditTypeEnum.INITIAL_VISIT) {
        await this.userRepo.updateMany(
          { _id: { $in: checkAudits.map((a) => a.hostId) } },
          { $set: { isAssignedForAudit: true } },
        );
      }
      return {
        data: [...updatedAudits],
        message: 'Assigned audits.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getAssignedAudits(payload: {
    auditorId: string;
    offset: number;
    limit: number;
    status?: string;
  }) {
    try {
      const { auditorId, offset, limit, status } = payload;
      // await this.userAuditRepo.updateMany({
      //   auditorId,
      //   createdAt: {
      //     $gte
      //   },
      //   ...(status &&
      //     status != 'All' && {
      //       status: status == 'New' ? 'Assigned' : status,
      //     }),
      // }, {

      // });
      return await this.userAuditRepo.paginate({
        filterQuery: {
          auditorId,
          ...(status &&
            status != 'All' && {
              status: status == 'New' ? 'Assigned' : status,
            }),
        },
        returnKey: 'audits',
        offset,
        limit,
      });
    } catch (err) {
      throw err;
    }
  }

  async getSingleAudit(payload: { projection?: object; filterQuery?: Object }) {
    try {
      const { projection, filterQuery } = payload;
      return await this.userAuditRepo.findOne(
        { ...filterQuery },
        { ...projection },
      );
    } catch (err) {
      throw err;
    }
  }

  async changeAuditStatus(payload: {
    auditId: string;
    auditorId: string;
    status: string;
    message: string | null;
    isHostConfirmed: boolean | null;
  }) {
    try {
      const { auditId, auditorId, status, message, isHostConfirmed } = payload;
      const audit = await this.userAuditRepo.findOne({
        _id: auditId,
        auditorId,
      });
      switch (status) {
        case UserAuditStatusEnum.IN_PROGRESS:
          if (
            audit.status == UserAuditStatusEnum.IN_PROGRESS ||
            audit.status == UserAuditStatusEnum.COMPLETED
          ) {
            throw new ConflictException('Audit already in progress');
          }
          break;

        case UserAuditStatusEnum.ON_HOLD:
          if (audit.status == UserAuditStatusEnum.ON_HOLD) {
            throw new ConflictException('Audit already on hold');
          }
          break;

        case UserAuditStatusEnum.COMPLETED:
          if (audit.status == UserAuditStatusEnum.COMPLETED) {
            throw new ConflictException('Audit already completed');
          }

          if (
            audit.auditType == UserAuditTypeEnum.INITIAL_VISIT &&
            isHostConfirmed
          ) {
            await this.userRepo.findOneAndUpdate(
              { _id: audit.hostId },
              { isHostConfirmed: true },
            );
          }
          break;
        default:
          throw new BadRequestException(
            `Audit status can not be changed to ${status}`,
          );
      }
      audit.status = status;
      audit.message = message;
      audit.confirmed = isHostConfirmed || false;
      audit.timeLine?.unshift({
        status: status,
        date: new Date(),
      });
      await this.userAuditRepo.upsert({ _id: auditId, auditorId }, audit);
      return {
        data: {
          auditType: audit.auditType,
          status: audit.status,
          confirmed: audit.confirmed,
          hostId: audit.hostId,
        },
        message: 'Status of audit changed.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getDashboardDetails(payload: { userId: string }) {
    try {
      const { userId } = payload;
      const data = await this.userAuditRepo.getDashboardData(userId);
      let assigned = 0,
        completed = 0,
        on_hold = 0,
        pending = 0,
        unassigned = 0,
        in_progress = 0,
        total = 0,
        target = 0,
        left_target = 0;

      data.forEach((element) => {
        switch (element._id) {
          case UserAuditStatusEnum.ASSIGNED:
            assigned = element.count;
            total += element.count;
            break;
          case UserAuditStatusEnum.PENDING:
            pending = element.count;
            total += element.count;
            break;
          case UserAuditStatusEnum.IN_PROGRESS:
          case UserAuditStatusEnum.ON_HOLD:
            in_progress = element.count;
            total += element.count;
            break;
          case UserAuditStatusEnum.COMPLETED:
            completed = element.count;
            total += element.count;
            break;
        }
      });

      if (completed > 0 && total > 0) {
        target = Math.floor((completed / total) * 100);
        left_target = 100 - target;
      }
      return {
        assigned: total,
        completed,
        unassigned,
        pending,
        on_hold,
        in_progress,
        target,
        left_target,
      };
    } catch (err) {
      throw err;
    }
  }

  async searchAudit(payload: any) {
    try {
      let aggregation: any = [];

      if (payload.location) {
        let longitude = payload.location[0];
        let latitude = payload.location[1];
        aggregation.push({
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)],
            },
            distanceField: 'distance',
            maxDistance: 5000,
          },
        });
      }

      aggregation.push({
        $addFields: {
          value: {
            $ifNull: [
              {
                $last: '$timeLine.date',
              },
              '$createdAt',
            ],
          },
        },
      });

      let match = {
        $expr: {
          $and: [],
        },
      };
      if (payload.searchHost) {
        match.$expr.$and.push({
          $regexMatch: {
            input: '$hostName',
            regex: payload.searchHost, //Your text search here
            options: 'i',
          },
        });
      }
      if (payload.officerName) {
        match.$expr.$and.push({
          $regexMatch: {
            input: '$auditorName',
            regex: payload.officerName, //Your text search here
            options: 'i',
          },
        });
      }
      if (payload.status) {
        match.$expr.$and.push({
          $regexMatch: {
            input: '$status',
            regex: payload.status, //Your text search here
            options: 'i',
          },
        });
      }
      if (payload.createdDate) {
        const requestedDate = new Date(payload.createdDate);
        let nextday = new Date(payload.createdDate);
        nextday = new Date(nextday.setDate(nextday.getDate() + 1));
        nextday = new Date(new Date(nextday.setUTCHours(23)).setUTCMinutes(59));
        match.$expr.$and.push({
          $and: [
            {
              $gte: ['$createdAt', requestedDate],
            },
            {
              $lt: ['$createdAt', nextday],
            },
          ],
        });
      }

      aggregation.push({
        $match: match,
      });
      // return aggregation
      return await this.userAuditRepo.aggregate(aggregation);
    } catch (err) {
      throw err;
    }
  }
}

