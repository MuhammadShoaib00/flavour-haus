import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  ApiMultipleFiles,
} from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CreateMenuDTO {
  @ApiProperty({ example: "Lily's Kitchen", required: true })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: "Lily's Kitchen", required: true })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiMultipleFiles({ required: false })
  menuImages?: any;
}

export class CreateMenuResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Food item added successfully.' })
  @IsString()
  message: string;
}
