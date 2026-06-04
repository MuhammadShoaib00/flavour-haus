import { Types } from 'mongoose';

export class AddCalendarBookingDto {
  title: string;
  date: string;
  start: string;
  end: string;
  className?: string;
  bookingId: Types.ObjectId;
  hostId: string;
  guestId: string;
}
