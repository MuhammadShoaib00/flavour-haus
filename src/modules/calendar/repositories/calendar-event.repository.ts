import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { CalendarEvent } from '../schemas/calendar-event.schema';

@Injectable()
export class CalendarEventRepository extends AbstractRepository<CalendarEvent> {
  protected readonly logger = new Logger(CalendarEventRepository.name);

  constructor(
    @InjectModel(CalendarEvent.name) calendarEventModel: Model<CalendarEvent>,
    @InjectConnection() connection: Connection,
  ) {
    super(calendarEventModel, connection);
  }
}
