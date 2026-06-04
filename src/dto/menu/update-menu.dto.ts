import { ApiProperty } from '@nestjs/swagger';
import { ApiMultipleFiles } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../../dto/common/ApiResponse.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMenuDTO {
  @ApiProperty({ example: "Lily's Kitchen" })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()

  description: any;

  @ApiMultipleFiles({ required: true })
  @IsNotEmpty()
  menuImages: any;
}

export class CreateMenuResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Food item added successfully.' })
  @IsString()
  message: string;
}
