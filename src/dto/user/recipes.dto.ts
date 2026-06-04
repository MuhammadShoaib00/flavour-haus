import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { ApiMultipleFiles } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetRecipiesResponse extends ApiResponseDto {
  @ApiProperty({
    example: {
      "collections": [
        {
          "_id": "637f57....9a97",
          "name": "Chicken Fajita",
          "hostId": "cb59cb....409b4c1",
          "description": "Chicken Fajita",
          "category": "chicken",
          "main_ingredient": "chicken",
          "cuisine": "asian",
          "ingredients": [
            {
              "name": "chicken",
              "unit": "KG",
              "qty": 2,
              "icon": "image"
            },
            {
              "name": "Onion",
              "unit": "Tablespoon",
              "qty": 4,
              "icon": "image"
            }
          ],
          "images": [
            {
              "id": "9ba425b....a3d06d2",
              "url": "users/cb59cbdf-........3-95b8-2aa3d06d2.png"
            },
            {
              "id": "9ba425b....a3d06d2",
              "url": "users/......-f9e0ebf841ae.png"
            }
          ],
          "servings": 2,
          "cookingTime": {
            "hours": 2,
            "mins": 20,
          },
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
    example: "All Recipes",
  })
  message: string;
}

export class CreateRecipeRequest {
  @IsNotEmpty()
  @MaxLength(80)
  @IsString()
  @ApiProperty({
    example: 'Chicken Fajita',
    required: true,
  })
  @Prop({ type: String, required: true })
  name: string;

  @IsNotEmpty()
  @MaxLength(250)
  @IsString()
  @ApiProperty({
    example: 'Chicken Fajita',
    required: true,
  })
  @Prop({ type: String, required: true })
  description: string;

  @IsNotEmpty()
  @MaxLength(80)
  @IsString()
  @ApiProperty({
    example: 'chicken',
    required: true,
  })
  @Prop({ type: String, required: true })
  category: string;
  
  @IsNotEmpty()
  @MaxLength(80)
  @IsString()
  @ApiProperty({
    example: 'chicken',
    required: true,
  })
  @Prop({ type: String, required: true })
  main_ingredient: string;
  
  @IsNotEmpty()
  @MaxLength(80)
  @IsString()
  @ApiProperty({
    example: 'asian',
    required: true,
  })
  @Prop({ type: String, required: true })
  cuisine: string;
  
  @IsNotEmpty()
  @ValidateNested({each: true})
  @Type(() => Ingredient)
  @IsArray()
  @ApiProperty({
    example: [
      {  name: "chicken", unit: "kg", unit_name: "kilogram", qty: 2, icon: "image_url" },
      {  name: "Onion", unit: "tbl", unit_name: "tablespoon", qty: 4, icon: "image_url" },
    ],
    required: true,
  })
  @Prop({ type: Array<Ingredient>, required: true })
  ingredients: Array<Ingredient>;

  // @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    required: true,
  })
  @Prop({ type: Number, required: true })
  servings: number;


  @ApiProperty({
    example: { hours: 2, mins: 20 },
    required: true,
  })
  @Prop({ type: { hours: Number, mins: Number }, required: true })
  cookingTime: { hours: number, mins: number };

  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  @ApiProperty({
    example: "Directions: .....",
    required: true,
  })
  @Prop({ type: String, required: true })
  cookingInstructions: string;

  @ApiProperty({
    required: false,
  })
  @Prop({ type: Object, required: false })
  nutritions?: object;

  @ApiMultipleFiles({ required: false })
  recipeImages?: any;
}

class Ingredient {
  @ApiProperty()
  @MaxLength(80)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty()
  @MaxLength(40)
  @IsString()
  @IsNotEmpty()
  unit_name: string;

  @ApiProperty()
  @IsNotEmpty()
  qty: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  icon: string;
}

export class CreateRecipeResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Listing created successfully.',
  })
  message: string;

  @ApiProperty({
    example: {
      "_id": "637f57....9a97",
      "name": "Chicken Fajita",
      "hostId": "cb59cb....409b4c1",
      "description": "Chicken Fajita",
      "category": "chicken",
      "main_ingredient": "chicken",
      "cuisine": "asian",
      "ingredients": [
        {
          "name": "chicken",
          "unit": "KG",
          "qty": 2,
          "icon": "image"
        },
        {
          "name": "Onion",
          "unit": "Tablespoon",
          "qty": 4,
          "icon": "image"
        }
      ],
      "images": [
        {
          "id": "9ba425b....a3d06d2",
          "url": "users/cb59cbdf-........3-95b8-2aa3d06d2.png"
        },
        {
          "id": "9ba425b....a3d06d2",
          "url": "users/......-f9e0ebf841ae.png"
        }
      ],
      "servings": 2,
      "cookingTime": {
        "hours": 2,
        "mins": 20,
      },
      "createdAt": "2022-11-24T11:35:30.654Z",
      "updatedAt": "2022-11-24T11:35:30.654Z"
    }
  })
  data: object
}

export class UpdatingRecipeRequest extends CreateRecipeRequest { }

export class UpdatingRecipeResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Recipe updated successfully.',
  })
  message: string;
}

export class DeletingRecipeRequest {
  @ApiProperty({
    example: ['637f7f78dbbb4ccbacf3f6be', '637f7f75dbbb4ccbacf3f6bd'],
    required: true,
  })
  @Prop({ type: Array<Types.ObjectId>, required: true })
  recipeIds: Array<Types.ObjectId>;
}

export class DeletingRecipeResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Recipe(s) deleted successfully.',
  })
  message: string;
}

export class DeletingRecipeImageRequest {
  @ApiProperty({
    example: 'users/cb59cbdf-fa0a-41c3-8590-99118409b4c1/recipe-images/cfdf9a84-414c-4df2-bd3f-f4afbfaca5aa.png',
    required: true,
  })
  @Prop({ type: String, required: true })
  imageUrl: string;
}

export class DeletingRecipeImageResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Recipe Image deleted successfully.',
  })
  message: string;
}

export class GetSingleRecipeResponse extends CreateRecipeResponse {
  @ApiProperty({
    example: "Single Recipe",
  })
  message: string;
}