import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiSingleFile } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CreateFoodIngredientRequestDto {
  @ApiProperty({ example: "Lily's Kitchen" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiSingleFile({ required: true })
  imageFile: any;
}

export class CreateFoodIngredientResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Food ingredient added successfully.' })
  message: string;
}
