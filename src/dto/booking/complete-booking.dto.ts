import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CompleteBookingDto {}

export class CompleteBookingResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Completed booking succesfully.' })
  message: string;
}
