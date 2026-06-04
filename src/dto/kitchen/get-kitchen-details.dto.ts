import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetKitchenDetailsRequestDto {
  @ApiProperty({ example: 'xxxx-xxxx-xxxxxxx-xxxxx' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class GetKitchenDetailsResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      kitchenId: '635xx6990xxx4c498670693x',
      userId: 'xxxxxxxx-xxxxx-xxxxxxx-xxxx',
      name: "Lily's Kitchen",
      coverPhotos: [
        {
          id: 'xxxxxxxx-xxxx-xxxxxxxxxx',
          url: 'users/xxxxxxxx-xxxxx-xxxxxxx-xxxx/kitchen/cover-photos/xxxxxxxx-xxxx-xxxxxxxxxx.png',
        },
        {
          id: 'xxxxxxxx-xxxx-xxxxxxxxxx',
          url: 'users/xxxxxxxx-xxxxx-xxxxxxx-xxxx/kitchen/cover-photos/xxxxxxxxx.png',
        },
      ],
      selectedCoverPhoto: 'xxxxxxxx-xxxx-xxxxxxxxxx',
      location: {
        address: 'Street 12, Main Boulvd., London, UK.',
        longitude: 106.6510714,
        latitude: 423.3738877,
      },
      servingDays: {
        Monday: true,
        Tuesday: false,
        Wednesday: true,
        Thursday: false,
        Friday: true,
        Saturday: false,
        Sunday: false,
      },
      servingTimeFrom: '17:03:11',
      servingTimeTo: '17:03:11',
      myFacilities: {
        numberOfGuest: 6,
        icon: [
          {
            id: 'xxxxxxxxxx',
          },
          {
            id: 'xxxxxxxxxx',
          },
          {
            id: 'xxxxxxxxxx',
          },
        ],
      },
    },
  })
  data: any;
}
