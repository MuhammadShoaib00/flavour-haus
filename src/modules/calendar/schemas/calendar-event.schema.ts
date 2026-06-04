import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';
import { BookingSlotClassName } from '../interfaces/booking-slot.enum';

@Schema({
  collection: 'calendar_events',
  versionKey: false,
})
export class CalendarEvent extends AbstractSchema {
  @Prop({ type: String, required: true, index: true })
  title: string;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: Boolean, required: false })
  allDay?: boolean;

  @Prop({ type: Date, required: false })
  start?: Date;

  @Prop({ type: Date, required: false })
  end?: Date;

  @Prop({ type: String, required: false, default: BookingSlotClassName.REMINDER, enum: BookingSlotClassName })
  className?: string;

  @Prop({ type: Array<string>, required: true, index: true })
  userIds: string[];

  @Prop({ type: SchemaTypes.ObjectId, required: false, ref: 'bookings' })
  bookingId?: Types.ObjectId;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
