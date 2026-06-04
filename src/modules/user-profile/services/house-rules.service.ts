import { Injectable, Logger } from '@nestjs/common';
import {
  CreateFoodIngredientDto,
  ListFoodIngredientsDto,
  UpdateHouseRulesDto,
  RestrictIngredientsDto,
} from '../dto/house-rules';
import { FoodIngredientRepository } from '../repositories/food-ingredient.repository';
import { KitchenRepository } from '../repositories/kitchen.repository';
import { S3Service } from '../shared/services/s3.service';

@Injectable()
export class HouseRulesService {
  private readonly logger = new Logger(HouseRulesService.name);

  constructor(
    private kitchenRepository: KitchenRepository,
    private foodIngredientRepository: FoodIngredientRepository,
    private s3: S3Service,
  ) {}

  async updateHouseRules(dto: UpdateHouseRulesDto) {
    try {
      const { userId, houseRules } = dto;
      let updates = {};
      Object.keys(houseRules).forEach((hR) => {
        updates[`houseRules.${hR}`] = houseRules[hR];
      });
      const { _id: kitchenId, ...data } =
        await this.kitchenRepository.findOneAndUpdate(
          {
            userId: userId,
          },
          {
            $set: updates,
          },
        );
      return {
        data: {
          ...Object.assign({ kitchenId }, Object(data)),
        },
        message: 'House Rules updated successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async listFoodIngredients(dto: ListFoodIngredientsDto) {
    try {
      const { userId, restricted } = dto;
      let restrictedFoodIngredients: string[];
      if (restricted) {
        const {
          houseRules: { restrictedFoods },
        } = await this.kitchenRepository.findOne({ userId });
        restrictedFoodIngredients = restrictedFoods;
      }
      const foodIngredients = await this.foodIngredientRepository.find({
        $or: [{ userId: null }, { userId }],
        ...(restricted && {
          $and: [{ _id: { $in: restrictedFoodIngredients } }],
        }),
      });

      return {
        data: foodIngredients.map(({ _id: foodIngredientId, ...data }) =>
          Object.assign({ foodIngredientId }, Object(data)),
        ),
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async createFoodIngredient(dto: CreateFoodIngredientDto) {
    try {
      const { userId, imageFile, ...foodIngredient } = dto;
      const { id, url } = await this.s3.uploadFile(
        imageFile,
        `users/${userId}/food-ingredients/{uuid}`,
      );

      const { ...data } = await this.foodIngredientRepository.create({
        _id: id,
        imageUrl: url,
        ...foodIngredient,
        userId: userId
      });
      return {
        data: {
          ...Object.assign({ foodIngredientId: id }, Object(data)),
        },
        message: 'Food ingredient created successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async updateRestrictedFood(dto: RestrictIngredientsDto) {
    try {
      const { userId, restrictedFoodIds } = dto;
      const {
        houseRules: { restrictedFoods },
      } = await this.kitchenRepository.findOneAndUpdate(
        {
          userId,
        },
        { $set: { 'houseRules.restrictedFoods': restrictedFoodIds } },
      );
      return {
        data: {
          restrictedFoods,
        },
        message: 'Restriced the food successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }
}

