import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ListFoodIngredientsRequestDto {}

export class ListFoodIngredientsResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: [
      {
        foodIngredientId: 'fc5e8e5d-e026-4a01-8e20-746a5a664bc4',
        title: 'Egg',
        imageUrl: 'icons/food-ingredients/egg.svg',
        userId: null,
      },
      {
        foodIngredientId: '6adb5052-263b-434e-b197-e2545f0aa7d5',
        title: 'Beef',
        imageUrl: 'icons/food-ingredients/beef.svg',
        userId: null,
      },
      {
        foodIngredientId: '7eb3f35d-3627-4146-a0a4-60345ddb8a68',
        title: 'Soybean',
        imageUrl: 'icons/food-ingredients/soybean.svg',
        userId: null,
      },
      {
        foodIngredientId: '7f664159-0ecf-401c-8cd3-55c888978950',
        title: 'Corn',
        imageUrl: 'icons/food-ingredients/corn.svg',
        userId: null,
      },
      {
        foodIngredientId: '9663e9e2-34c0-4f31-b3d7-b672a9ae48e6',
        title: 'Vegetarian',
        imageUrl: 'icons/food-ingredients/veg.svg',
        userId: null,
      },
      {
        foodIngredientId: 'ec9830ee-7326-424c-84bf-db523b683e11',
        title: 'Milk and Diary',
        imageUrl: 'icons/food-ingredients/milk.svg',
        userId: null,
      },
      {
        foodIngredientId: '0f7d53b7-8b30-4d0c-8aee-467a4de54dd2',
        title: 'Peanut',
        imageUrl: 'icons/food-ingredients/peanut.svg',
        userId: null,
      },
      {
        foodIngredientId: 'c0f06cff-c375-4b38-906d-068fb04594eb',
        title: 'Fish',
        imageUrl: 'icons/food-ingredients/fish.svg',
        userId: null,
      },
      {
        foodIngredientId: '9220399d-4232-4cd2-87c1-50e79f0dd6cb',
        title: 'Halal',
        imageUrl: 'icons/food-ingredients/halal.svg',
        userId: null,
      },
      {
        foodIngredientId: '50b7e664-78ee-4c3e-abb6-fc54161b7a4f',
        title: 'Gluten',
        imageUrl: 'icons/food-ingredients/gluten.svg',
        userId: null,
      },
    ],
  })
  data: any;
}
