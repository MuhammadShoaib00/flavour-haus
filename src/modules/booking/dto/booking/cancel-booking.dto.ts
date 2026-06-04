import { Types } from 'mongoose';

export class CancelBookingDto {
  bookingId: Types.ObjectId;
  cancellationReason: string;
  userId: string;
  defaultRole: string;
}
