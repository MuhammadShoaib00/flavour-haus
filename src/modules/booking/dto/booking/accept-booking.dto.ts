import { BookingUserType } from '../../interfaces/booking-user-types.enum';
import { BookingStatus } from '../../interfaces/booking-status.enum';
import { Types } from 'mongoose';

export class AcceptBookingDto {
  bookingId: Types.ObjectId;
  userId: string;
}
