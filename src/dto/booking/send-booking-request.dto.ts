import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsInstance,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { number } from 'joi';
import { isString } from 'lodash';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class SendBookingRequestRequestDto {
  @ApiProperty({ example: '634d7de53a0a1b59d2b82cd5' })
  listingId: string;

  @ApiProperty({ example: '2022-01-20' })
  @IsString()
  date: string;

  @ApiProperty({
    example: {
      startTime: '05:00:00',
      endTime: '08:00:00',
    },
  })
  @IsObject()
  timeRange: {
    startTime: string;
    endTime: string;
  };

  @ApiProperty({
    example: {
      adults: 2,
      children: 1,
      infants: 3,
    },
  })
  @IsObject()
  noOfGuests: {
    adults: number;
    children: number;
    infants: number;
  };
  @ApiProperty({ example: 'Kindly remove wheat.' })
  @IsOptional()
  @IsString()
  specialInstructions: string;
}

export class SendBookingRequestResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Sent booking request successfully.' })
  message: string;
}
