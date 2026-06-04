import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, isNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class AcceptBookingRequestDto {

  bookingId: Types.ObjectId;
}

export class AcceptBookingResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Accepted booking succesfully.' })
  @IsString()
  message: string;
}
