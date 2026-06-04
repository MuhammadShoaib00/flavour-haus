import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetBookingDetailsRequestDto {
 
  bookingId: Types.ObjectId;
}

export class GetBookingDetailsResponseDto extends ApiResponseDto {
  @ApiProperty({ example: {} })
  data: any;
}
