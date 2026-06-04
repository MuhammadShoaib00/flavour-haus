import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CancelBookingRequestDto {
  @ApiProperty({ example: "I've changed my mind." })
  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}

export class CancelBookingResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Cancelled booking succesfully.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
