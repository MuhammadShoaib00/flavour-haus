import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Food } from '../schemas/food.schema';
import {AbstractRepository} from "../shared/class/abstract.repository";

@Injectable()
export class FoodRepository extends AbstractRepository<Food> {
  protected readonly logger = new Logger(FoodRepository.name);

  constructor(
    @InjectModel("fooditems") FoodModel: Model<Food>,
    @InjectConnection() connection: Connection,
  ) {
    super(FoodModel, connection);
  }
}
