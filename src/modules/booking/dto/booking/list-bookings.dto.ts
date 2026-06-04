import { BookingUserType } from '../../interfaces/booking-user-types.enum';
import { BookingStatus } from '../../interfaces/booking-status.enum';

export class ListBookingsDto {
  userRole: BookingUserType;
  status: BookingStatus | 'ALL';
  from?: Date;
  to?: Date;
  search?: string;
  limit: number;
  offset: number;
  userId: string;
  rated?: string;
  hostId?: string;
}
