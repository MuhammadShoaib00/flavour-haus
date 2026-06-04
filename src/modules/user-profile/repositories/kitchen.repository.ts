import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Kitchen } from '../schemas/kitchen.shema';

@Injectable()
export class KitchenRepository extends AbstractRepository<Kitchen> {
  protected readonly logger = new Logger(KitchenRepository.name);

  constructor(
    @InjectModel(Kitchen.name) kitchenModel: Model<Kitchen>,
    @InjectConnection() connection: Connection,
  ) {
    super(kitchenModel, connection);
  }
}
