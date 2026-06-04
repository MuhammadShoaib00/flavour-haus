import { Injectable, Logger } from '@nestjs/common';
import { GetNutritionsResponse } from '../dto/nutritions.dto';
import { Recipe } from '../schemas/recipe.schema';
import { RecipeRepository } from '../repositories/recipe.repository';
import { NutritionService } from './nutrition.service';
import { S3Service } from './s3.service';

@Injectable()
export class RecipeService {
  constructor(private recipeRepo: RecipeRepository, private s3: S3Service, private nutritionService: NutritionService) { }

  async getRecipes({ hostId, limit, offset, search }: { hostId?: string; limit: number; offset: number; search?: string }) {
    try {
      const filter = hostId ? { hostId } : {};
      search = search || '';
      const filterQuery = {
        ...filter,
        "$or": [
          { "name": { $regex: search.toLowerCase(), $options: "i" } },
          { "description": { $regex: search.toLowerCase(), $options: "i" } },
          { "category": { $regex: search.toLowerCase(), $options: "i" } },
          { "main_ingredient": { $regex: search.toLowerCase(), $options: "i" } },
          { "cuisine": { $regex: search.toLowerCase(), $options: "i" } },
          { "ingredients.name": { $regex: search.toLowerCase(), $options: "i" } }
        ]
      }
      return await this.recipeRepo.paginate({ filterQuery, offset, limit, returnKey: 'recipes', pipelines: [] });
    } catch (err) {
      throw err;
    }
  }

  async singleRecipe({ recipeId }: { recipeId: string }) {
    try {
      return await this.recipeRepo.findOne({ _id: recipeId });
    } catch (err) {
      throw err;
    }
  }

  async addRecipe({ dto, hostId, recipeImages }: { dto: any; hostId: string; recipeImages: any[] }) {
    try {
      const recipe: any = { ...dto, hostId };
      const images = recipeImages;
      const url = `users/${hostId}/recipe-images/{uuid}`
      recipe.images = await this.uploadAllImages(images, url);

      const query = recipe.ingredients.map(function(item){
        return `${item.qty} ${item.unit} ${item.name}`
      });
      recipe.nutritions = await this.nutritionService.getNutritions(query.join(', ')) || {};
      return await this.recipeRepo.create(recipe);
    } catch (err) {
      throw err;
    }
  }

  async updateRecipe({ dto, hostId, recipeImages }: { dto: any; hostId: string; recipeImages: any[] }) {
    try {
      const recipe = dto;
      const images = recipeImages;
      const current_recipe = await this.recipeRepo.findOne({ _id: recipe.recipeId, hostId: hostId });

      if (images != null && images.length > 0) {
        const url = `users/${hostId}/recipe-images/{uuid}`;
        const uploaded_images = await this.uploadAllImages(images, url);

        if (current_recipe.images != null && current_recipe.images.length > 0) {
          recipe.images = [...current_recipe.images, ...uploaded_images];
        } else {
          recipe.images = uploaded_images;
        }
      }
      const query = recipe.ingredients.map(function(item){
        return `${item.qty} ${item.unit} ${item.name}`
      });
      recipe.nutritions = await this.nutritionService.getNutritions(query.join(', '));
      return await this.recipeRepo.findOneAndUpdate({ _id: recipe.recipeId }, recipe);
    } catch (err) {
      throw err;
    }
  }

  async removeRecipe({ recipeIds, hostId }: { recipeIds: string[]; hostId: string }) {
    try {
      const recipes = await this.recipeRepo.find({ _id: { '$in': recipeIds } });
      let s3files = [];
      recipes.forEach(element => {
        if (element.images != null && element.images.length > 0) {
          const files = element.images.map(function (item) { return { Key: item['url'] } });
          s3files = [...s3files, ...files];
        }
      });

      try {
        await this.s3.deleteFiles(s3files);
      } catch (e) { }

      await this.recipeRepo.deleteMany({ hostId }, recipeIds);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async removeRecipeImage({ recipeId, imageUrl, hostId }: { recipeId: string; imageUrl: string; hostId: string }) {
    try {
      let recipe = await this.recipeRepo.findOne({ _id: recipeId, hostId });
      const newImages = recipe?.images?.filter(item => {
        return item['url'] != imageUrl;
      })
      await this.s3.deleteFile(imageUrl);
      recipe.images = newImages;
      await this.recipeRepo.findOneAndUpdate({ _id: recipe._id }, recipe);
      return true;
    } catch (err) {
      throw err;
    }
  }

  private async uploadAllImages(images, url) {
    if (images && images.length != 0) {
      return await Promise.all(
        images?.map((coverPhoto) => {
          return this.s3.uploadFile(coverPhoto, url);
        }),
      );
    } else {
      return [];
    }
  }

  async getNutritionalInfo({ query }: { query: string }): Promise<GetNutritionsResponse> {
    return await this.nutritionService.getNutritions(query);
  }
}

