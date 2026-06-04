import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { UserTraining } from '../schemas/user_trainings.schema';

@Injectable()
export class UserTrainingsRepository extends AbstractRepository<UserTraining> {
  protected readonly logger = new Logger(UserTrainingsRepository.name);

  constructor(
    @InjectModel(UserTraining.name) UserTrainingModel: Model<UserTraining>,
    @InjectConnection() connection: Connection,
  ) {
    super(UserTrainingModel, connection);
  }
}
