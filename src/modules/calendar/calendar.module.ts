import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarService } from './services/calendar.service';
import { CalendarEventRepository } from './repositories/calendar-event.repository';
import { CalendarEvent, CalendarEventSchema } from './schemas/calendar-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
    ]),
  ],
  providers: [CalendarService, CalendarEventRepository],
  exports: [CalendarService],
})
export class CalendarModule {}
