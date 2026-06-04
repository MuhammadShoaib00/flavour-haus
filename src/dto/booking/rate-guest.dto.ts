import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class RateGuestRequestDto {
  // @ApiProperty({ example: '1' })
  // numberOfGuest: Number;
  @ApiProperty({ example: 'guest is good' })
  @IsNotEmpty()
  @IsString()
  review: string;
  @ApiProperty({ example: '3.5' })
  @IsNotEmpty()
  @IsNumber()
  rating: number
  // @ApiProperty({ example: 'xxxxx' })
  // _userid: String;
}

export class RateGuestResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Rate Guest succesfully.' })
  @IsString()
  message: string;
} 