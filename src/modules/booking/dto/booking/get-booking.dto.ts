import { BookingUserType } from '../../interfaces/booking-user-types.enum';
import { Types } from 'mongoose';

export class GetBookingDto {
  bookingId: Types.ObjectId;
  userRole: BookingUserType;
  userId: string;
}
