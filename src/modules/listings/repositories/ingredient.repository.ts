import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Ingredient } from '../schemas/ingredient.schema';

@Injectable()
export class IngredientRepository extends AbstractRepository<Ingredient> {
  protected readonly logger = new Logger(IngredientRepository.name);

  constructor(
    @InjectModel(Ingredient.name) ingredientModel: Model<Ingredient>,
    @InjectConnection() connection: Connection,
  ) {
    super(ingredientModel, connection);
  }
}
