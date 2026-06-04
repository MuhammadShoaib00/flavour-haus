import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiMultipleFiles } from '../../shared/decorators/custom';

export class UpdateFoodItemsRequestDto {
  @ApiProperty({ example: 'no', required: false })
  @IsNotEmpty()
  @IsString()
  ageRestriction: string;

  @ApiProperty({ example: 'available', required: false })
  @IsNotEmpty()
  @IsString()
  available: string;

  @ApiProperty({ example: 'African', required: false })
  cuisine: string;

  @ApiProperty({ example: 'abccccc', required: false })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Vegan', required: false })
  @IsNotEmpty()
  @IsString()
  dietary: string;

  @ApiProperty({ example: 'Mid', required: false })
  @IsNotEmpty()
  @IsString()
  spice: string;

  @ApiProperty({ example: 'Chicken Burger', required: false })
  // @IsNotEmpty()
  @IsString()
  recipe: string;

  @ApiProperty({ example: 'Green Maxician Chicken Salad', required: false })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ example: 'Chicken', required: false })
  itemCategory: string;

  @ApiProperty({ example: '["Fast Food"]', required: false })
  // @IsNotEmpty()
  // @IsArray()
  ingredient: string;

  @ApiProperty({ example: '["Dairy"]', required: false })
  // @IsNotEmpty()
  // @IsArray()
  allergen: string;

  @ApiProperty({ example: '', required: false })
  badgeId: string;

  @ApiMultipleFiles({ required: false })
  foodImages: any;

  @ApiProperty({
    example: {
      calories: { value: 0, unit: 'kcal' },
      total_fat: { value: 0, unit: 'g' },
      saturated_fat: { value: 0, unit: 'g' },
      cholesterol: { value: 0, unit: 'mg' },
      sodium: { value: 0, unit: 'mg' },
      total_carbohydrate: { value: 0, unit: 'g' },
      dietary_fiber: { value: 0, unit: 'g' },
      sugars: { value: 0, unit: 'g' },
      protein: { value: 0, unit: 'g' },
      potassium: { value: 0, unit: 'mg' },
    },
  })
  @IsNotEmpty()
  nutritions: {
    calories: { value: number; unit: string };
    total_fat: { value: number; unit: string };
    saturated_fat: { value: number; unit: string };
    cholesterol: { value: number; unit: string };
    sodium: { value: number; unit: string };
    total_carbohydrate: { value: number; unit: string };
    dietary_fiber: { value: number; unit: string };
    sugars: { value: number; unit: string };
    protein: { value: number; unit: string };
    potassium: { value: number; unit: string };
  };
}
