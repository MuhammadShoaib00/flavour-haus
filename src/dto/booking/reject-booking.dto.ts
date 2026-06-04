import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class RejectBookingRequestDto {
  @ApiProperty({ example: "I've changed my mind." })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}

export class RejectBookingResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Rejected booking succesfully.' })
  @IsString()
  message: string;
}
