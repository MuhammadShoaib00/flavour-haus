import { Types } from 'mongoose';

export class RejectBookingDto {
  bookingId: Types.ObjectId;
  rejectionReason: string;
  userId: string;
}
