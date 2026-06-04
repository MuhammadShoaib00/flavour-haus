import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { BookingTimeline } from '../schemas/booking-timeline.schema';

@Injectable()
export class BookingTimelineRepository extends AbstractRepository<BookingTimeline> {
  protected readonly logger = new Logger(BookingTimelineRepository.name);

  constructor(
    @InjectModel(BookingTimeline.name)
    bookingTimelineModel: Model<BookingTimeline>,
    @InjectConnection() connection: Connection,
  ) {
    super(bookingTimelineModel, connection);
  }
}
