import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Right } from '../schemas/right.schema';

@Injectable()
export class RightRepository extends AbstractRepository<Right> {
  protected readonly logger = new Logger(RightRepository.name);

  constructor(
    @InjectModel(Right.name) rightModel: Model<Right>,
    @InjectConnection() connection: Connection,
  ) {
    super(rightModel, connection);
  }
}
