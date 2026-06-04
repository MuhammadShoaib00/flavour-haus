import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ListingService } from './services/listing.service';
import { ListingRepository } from './repositories/listing.repository';
import { RecipeService } from './services/recipe.service';
import { RecipeRepository } from './repositories/recipe.repository';
import { IngredientRepository } from './repositories/ingredient.repository';
import { IngredientService } from './services/ingredient.service';
import { NutritionService } from './services/nutrition.service';
import { Listing, ListingSchema } from './schemas/listing.schema';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { Ingredient, IngredientSchema } from './schemas/ingredient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Listing.name, schema: ListingSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Ingredient.name, schema: IngredientSchema },
    ]),
    HttpModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 3,
        baseURL: config.get('NUTRITIONIX_BASE_URL'),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-app-id': config.get('NUTRITIONIX_APP_ID'),
          'X-app-key': config.get('NUTRITIONIX_APP_KEY'),
          'X-remote-user-id': 0,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ListingService,
    ListingRepository,
    RecipeService,
    RecipeRepository,
    IngredientRepository,
    IngredientService,
    NutritionService,
  ],
  exports: [ListingService, RecipeService, IngredientService],
})
export class ListingsModule {}
