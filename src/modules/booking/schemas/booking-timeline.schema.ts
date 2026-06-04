import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';
import { SchemaTypes, Types } from 'mongoose';
import { BookingStatus } from '../interfaces/booking-status.enum';

@Schema({
  collection: 'booking_timelines',
  versionKey: false,
  timestamps: true,
})
export class BookingTimeline extends AbstractSchema {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
    ref: 'bookings',
  })
  bookingId: Types.ObjectId;

  @Prop({
    type: {
      [BookingStatus.NEW]: Date,
      [BookingStatus.ACCEPTED]: Date,
      [BookingStatus.REJECTED]: Date,
      [BookingStatus.CONFIRMED]: Date,
      [BookingStatus.CANCELLED]: Date,
      [BookingStatus.COMPLETED]: Date,
    },
    required: true,
    _id: false
  })
  timeline: Timeline;
}

export interface Timeline {
  [BookingStatus.NEW]: Date,
  [BookingStatus.ACCEPTED]?: Date,
  [BookingStatus.REJECTED]?: Date,
  [BookingStatus.CONFIRMED]?: Date,
  [BookingStatus.CANCELLED]?: Date,
  [BookingStatus.COMPLETED]?: Date,
}

export const BookingTimelineSchema =
  SchemaFactory.createForClass(BookingTimeline);
