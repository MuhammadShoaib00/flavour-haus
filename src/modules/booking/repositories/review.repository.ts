import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
// import { Trainings } from '../schemas/trainings.schema';
import { Review } from '../schemas/review.schema';

@Injectable()
export class ReviewRepository extends AbstractRepository<Review> {
  protected readonly logger = new Logger(ReviewRepository.name);

  constructor(
    @InjectModel("reviews") reviewModel: Model<Review>,
    @InjectConnection() connection: Connection,
  ) {
    super(reviewModel, connection);
  }
}
