import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class RatingResponseDto extends ApiResponseDto {
    @ApiProperty({ example: 'Rating  list.' })
    @IsString()
    message: string;
  } 