import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { FoodIngredient } from '../schemas/food-ingredient.schema';

@Injectable()
export class FoodIngredientRepository extends AbstractRepository<FoodIngredient> {
  protected readonly logger = new Logger(FoodIngredientRepository.name);

  constructor(
    @InjectModel(FoodIngredient.name)
    foodIngredientModel: Model<FoodIngredient>,
    @InjectConnection() connection: Connection,
  ) {
    super(foodIngredientModel, connection);
  }
}
