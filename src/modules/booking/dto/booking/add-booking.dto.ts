import { Types } from 'mongoose';
import { FoodItem } from '../../interfaces/food-item.interface';
import { Timing } from '../../interfaces/timing.interface';

export class AddBookingDto {
  host: {
    id: string;
    profileImage: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  kitchenId: Types.ObjectId;
  menu: {
    id: Types.ObjectId;
    title: string;
    description: string;
  }
  foodItems: Array<FoodItem>;
  pricePerGuest: number;
  selectedTiming: Timing;

  guest: {
    id: string;
    profileImage: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  listingId: Types.ObjectId;
  listingTitle: string;

  date?: string;
  timeRange?: {
    startTime: string;
    endTime: string;
  };
  noOfGuests: {
    adults: number;
    children: number;
    infants: number;
  };
  specialInstructions?: string;
  totalPrice: number;
  timings?: [
    {
      startDate: string,
      endDate: string,
      timeRanges: [
        {
          "startTime": string,
          "endTime": string
        }
      ]
    },
  ]


  // paymentStatus?: any;
}
