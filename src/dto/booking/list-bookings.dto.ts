import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BookingStatus } from '../../shared/interfaces/booking/booking-status.enum';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ListBookingsRequestDto {
  @IsString()
  @IsNotEmpty()
  status: BookingStatus | 'ALL';
  @IsDate()
  from?: Date;
  @IsDate()
  to?: Date;
  @IsNotEmpty()
  @IsNumber()
  limit: number;
  @IsNumber()
  @IsNotEmpty()
  offset: number;
}

export class ListBookingsResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      bookings: [],
      meta: {},
    },
  })
  data: any;
}
