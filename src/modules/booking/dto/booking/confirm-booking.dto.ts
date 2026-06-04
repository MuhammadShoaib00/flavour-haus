import { Types } from 'mongoose';

export class ConfirmBookingDto {
  bookingId: Types.ObjectId;
  userId: string;
}
