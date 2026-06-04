import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import {
  ApiMultipleFiles,
  ApiSingleFile,
} from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CreateKitchenRequestDto {
  @ApiProperty({ example: "Lily's Kitchen" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiMultipleFiles({ required: true })
  // @IsNotEmpty()
  coverPhotos?: any;

  @ApiProperty({ example: 'Outdoor.png', required: false })
  @IsNotEmpty()
  @IsString()
  selectedPhoto?: string;

  @ApiProperty({
    example: {
      address: 'Street 12, Main Boulvd., London, UK.',
      longitude: 106.6510714,
      latitude: 423.3738877,
    },
    required: false,
  })
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
  servingDays?: Object;

  @ApiProperty({
    example: '17:03:11',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  servingTimeFrom?: string;
  @ApiProperty({
    example: '17:03:11',
    required: false,
  }) 
  @IsString()
  @IsNotEmpty()
  servingTimeTo?: string;
}

export class CreateKitchenResponseDto extends ApiResponseDto {}
