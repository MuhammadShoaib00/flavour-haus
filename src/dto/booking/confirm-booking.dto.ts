import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ConfirmBookingDto {
 
  bookingId: Types.ObjectId;
}

export class ConfirmBookingResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Confirmed booking succesfully.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
