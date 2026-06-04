export class UpdateKitchenDetailsDto {
  userId: string;
  kitchenId?: string;
  name?: string;
  coverPhotos?: any[];
  location?: {
    address?: string;
    longitude?: number;
    latitude?: number;
  };
  servingDays?: Object;
  servingTimeFrom?: string;
  servingTimeTo?: string;
}
