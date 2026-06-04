import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Wishlist } from '../schemas/wishlist.schema';

@Injectable()
export class WishlistRepository extends AbstractRepository<Wishlist> {
  protected readonly logger = new Logger(WishlistRepository.name);

  constructor(
    @InjectModel(Wishlist.name) wishlistModel: Model<Wishlist>,
    @InjectConnection() connection: Connection,
  ) {
    super(wishlistModel, connection);
  }
}
