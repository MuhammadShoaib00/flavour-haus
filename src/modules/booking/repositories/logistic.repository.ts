import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model, Connection } from 'mongoose';
import { AbstractRepository } from "../shared/classes/abstract.repository";
import { Logistic } from "../schemas/logistic.schema";

@Injectable()
export class LogisticRepository extends AbstractRepository<Logistic> {
  protected readonly logger = new Logger(LogisticRepository.name);

  constructor(
    @InjectModel("Logistic") logisticModel: Model<Logistic>,
    @InjectConnection() connection: Connection,
  ) {
    super(logisticModel, connection);
  }

  async getLogisticsWithBookingNo(bookingId) {
    const query = [
      { $match: { bookingId: new mongoose.Types.ObjectId(bookingId) } },
      {
        $lookup: {
          from: 'bookings',
          let: { 'bookingId': '$bookingId'},
          pipeline: [{
              $match: { $expr: { $eq: [ '$_id', '$$bookingId' ]} }
            }, 
            {
              $project: {bookingNo: '$bookingId'}
            }
          ],
          as: 'bookingDetails'
        }
      }, {
        $unwind: {
          path: '$bookingDetails',
          preserveNullAndEmptyArrays: true
        }
      }
    ];
    return await this.aggregate(query);
  }
}
