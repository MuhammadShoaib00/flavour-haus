import { Types } from 'mongoose';

export class CompleteBookingDto {
  bookingId: Types.ObjectId;
  userId: string;
}
