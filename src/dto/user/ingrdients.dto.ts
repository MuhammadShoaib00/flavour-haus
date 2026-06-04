import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Types } from 'mongoose';
import { ApiSingleFile } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetIngredientsResponse extends ApiResponseDto {
  @ApiProperty({
    example: {
      "collections": [
        {
          "_id": "637f57....9a97",
          "name": "Chicken",
          "icon": "image_url",
          "createdAt": "2022-11-24T11:35:30.654Z",
          "updatedAt": "2022-11-24T11:35:30.654Z"
        }
      ],
      "total": 8,
      "offset": "0",
      "limit": "1"
    }
  })
  data: Array<any>;
  @ApiProperty({
    example: "All Ingredients",
  })
  message: string;
}

export class GetIngredientsForRecipesResponse extends ApiResponseDto {
  @ApiProperty({
    example: [
      {
        "_id": "637f57....9a97",
        "name": "Chicken",
        "icon": "image_url",
      }
    ]
  })
  data: Array<any>;
  @ApiProperty({
    example: "All Ingredients",
  })
  message: string;
}

export class CreateIngredientRequest {
  @MaxLength(80)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Chicken',
    required: true,
  })
  @Prop({ type: String, required: true })
  name: string;

  @ApiSingleFile({ required: false })
  icon?: any;
}

export class CreateIngredientResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Listing created successfully.',
  })
  message: string;

  @ApiProperty({
    example: {
        "_id": "637f57....9a97",
        "name": "Chicken",
        "icon": "image_url",
        "createdAt": "2022-11-24T11:35:30.654Z",
        "updatedAt": "2022-11-24T11:35:30.654Z"
      }
    })
  data: object
}

export class UpdatingIngredientRequest extends CreateIngredientRequest {}

export class UpdatingIngredientResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Ingredient updated successfully.',
  })
  message: string;
}

export class DeletingIngredientRequest {
  @ApiProperty({
    example: ['637f7f78dbbb4ccbacf3f6be', '637f7f75dbbb4ccbacf3f6bd'],
    required: true,
  })
  @Prop({ type: Array<Types.ObjectId>, required: true })
  ingredientIds: Array<Types.ObjectId>;
}

export class DeletingIngredientResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Ingredient(s) deleted successfully.',
  })
  message: string;
}

export class SingleIngredientQuery {
  @ApiProperty({
    nullable: true,
    default: "637e4047bea75463aff961d0",
    required: true,
  })
  ingredientId: string;
}

export class GetSingleIngredientResponse extends CreateIngredientResponse {
  @ApiProperty({
    example: "Single Ingredient",
  })
  message: string;
}