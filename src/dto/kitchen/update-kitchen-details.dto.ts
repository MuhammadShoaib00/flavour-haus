import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isObject, IsObject, IsString } from 'class-validator';
import { ApiMultipleFiles } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class UpdateKitchenDetailsRequestDto {
  @ApiProperty({ example: 'xxxx-xxxx-xxxxxxx-xxxxx' })
  @IsString()
  @IsNotEmpty()
  kitchenId: string;

  @ApiProperty({ example: "Lily's Kitchen" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiMultipleFiles({ required: false })
  coverPhotos?: any;

  @ApiProperty({ example: 'Outdoor.png', required: false })
  @IsString()
  selectedPhoto?: string;

  @ApiProperty({
    example: {
      address: 'Street 12, Main Boulvd., London, UK.',
      longitude: 106.6510714,
      latitude: 423.3738877,
    },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  location?: {
    address?: string;
    longitude?: number;
    latitude?: number;
  };

  @ApiProperty({
    example: {
      Monday: true,
      Tuesday: false,
      Wednesday: true,
      Thursday: false,
      Friday: true,
      Saturday: false,
      Sunday: false,
    },
    required: false,
  })
  @IsObject()
  @IsNotEmpty()
  servingDays?: Object;

  @ApiProperty({
    example: '17:03:11',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  servingTimeFrom?: string;
  @ApiProperty({
    example: '17:03:11',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  servingTimeTo?: string;
}

export class UpdateKitchenDetailsResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Updated kitchen details successfully.' })
    @IsString()
  message: string;
}
