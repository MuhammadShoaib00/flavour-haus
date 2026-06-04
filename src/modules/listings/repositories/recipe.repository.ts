import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Recipe } from '../schemas/recipe.schema';

@Injectable()
export class RecipeRepository extends AbstractRepository<Recipe> {
  protected readonly logger = new Logger(RecipeRepository.name);

  constructor(
    @InjectModel(Recipe.name) recipeModel: Model<Recipe>,
    @InjectConnection() connection: Connection,
  ) {
    super(recipeModel, connection);
  }
}
