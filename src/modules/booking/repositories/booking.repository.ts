import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Booking } from '../schemas/booking.schema';

@Injectable()
export class BookingRepository extends AbstractRepository<Booking> {
  protected readonly logger = new Logger(BookingRepository.name);

  constructor(
    @InjectModel(Booking.name) bookingModel: Model<Booking>,
    @InjectConnection() connection: Connection,
  ) {
    super(bookingModel, connection);
  }
}
