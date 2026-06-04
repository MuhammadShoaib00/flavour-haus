import { Injectable, Logger } from '@nestjs/common';
import { Ingredient } from '../schemas/ingredient.schema';
import { IngredientRepository } from '../repositories/ingredient.repository';
import { S3Service } from './s3.service';

@Injectable()
export class IngredientService {
  constructor(
    private ingredientRepo: IngredientRepository,
    private s3: S3Service,
  ) { }

  async getIngredients({ hostId, offset, limit, search }: { hostId?: string; offset: number; limit: number; search?: string }) {
    try {
      const filter = hostId ? { hostId } : {};
      search = search || '';
      const filterQuery = {
        ...filter,
        $or: [
          { name: { $regex: search.toLowerCase(), $options: 'i' } },
          { unit: { $regex: search.toLowerCase(), $options: 'i' } },
        ],
      };
      return await this.ingredientRepo.paginate({
        filterQuery,
        offset,
        limit,
        returnKey: 'ingredients',
        pipelines: [],
      });
    } catch (err) {
      throw err;
    }
  }

  async getIngredientsForRecipes({ hostId }: { hostId: string }) {
    try {
      const filter = {
        $or: [
          {hostId: hostId},
          {hostId: {$exists: false}},
          {hostId: null}
        ]
      }
      return await this.ingredientRepo.find({...filter}, {createdAt: 0, updatedAt: 0, hostId: 0});
    } catch (err) {
      throw err;
    }
  }

  async getIngredient({ ingredientId }: { ingredientId: string }) {
    try {
      return await this.ingredientRepo.findOne({ _id: ingredientId });
    } catch (err) {
      throw err;
    }
  }

  async addIngredient({ dto, hostId, icon }: { dto: any; hostId: string; icon: any }) {
    try {
      const ingredient: any = { ...dto, hostId };
      if (icon) {
        const url = `users/${hostId}/ingredient-images/{uuid}`;
        ingredient.icon = (await this.s3.uploadFile(icon, url))?.url;
      }
      return await this.ingredientRepo.create(ingredient);
    } catch (err) {
      throw err;
    }
  }

  async updateIngredient({ dto, hostId, icon }: { dto: any; hostId: string; icon: any }) {
    try {
      const ingredient = dto;
      const current_recipe = await this.ingredientRepo.findOne({
        _id: ingredient.ingredientId,
        hostId: hostId,
      });

      if (icon) {
        const url = `users/${hostId}/ingredient-images/{uuid}`;
        ingredient.icon = (await this.s3.uploadFile(icon, url))?.url;
        await this.s3.deleteFile(current_recipe.icon);
      }
      return await this.ingredientRepo.findOneAndUpdate(
        { _id: ingredient.ingredientId },
        ingredient,
      );
    } catch (err) {
      throw err;
    }
  }

  async removeIngredient({ ingredientIds, hostId }: { ingredientIds: string[]; hostId: string }) {
    try {
      const ingredients = await this.ingredientRepo.find({
        _id: { $in: ingredientIds },
      });
      let s3files = [];
      ingredients.forEach((element) => {
        if (element.icon != null && element.icon != '') {
          const icon = { Key: element.icon };
          s3files = [...s3files, icon];
        }
      });

      try {
        await this.s3.deleteFiles(s3files);
      } catch (e) { }

      await this.ingredientRepo.deleteMany({ hostId }, ingredientIds);
      return true;
    } catch (err) {
      throw err;
    }
  }
}

