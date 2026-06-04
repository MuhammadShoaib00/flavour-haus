

export class CreateKitchenDto {
  userId: string | any;
  userName: string;
  userRating: number;
  name: string;
  coverPhotos?: any[];
  location?: {
 
    address?: string;
    longitude?: number;
    latitude?: number;
  };
  servingDays?: Object | any;
  servingTimeFrom?: string;
  servingTimeTo?: string;
}
