import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Listing } from '../schemas/listing.schema';

@Injectable()
export class ListingRepository extends AbstractRepository<Listing> {
  protected readonly logger = new Logger(ListingRepository.name);

  constructor(
    @InjectModel(Listing.name) listingModel: Model<Listing>,
    @InjectConnection() connection: Connection,
  ) {
    super(listingModel, connection);
  }
}
