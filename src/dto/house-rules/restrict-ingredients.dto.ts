import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class RestrictIngredientsRequestDto {
  @ApiProperty({ example: ['xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'] })
  restrictedFoodIds: string[];
}

export class RestrictIngredientsResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      restrictedFoods: [
        'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      ],
    },
  })
  data: any;

  @ApiProperty({
    example: 'Restricted the food successfully.',
  })
  message: string;
}
