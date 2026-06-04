import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UserRibbons } from '../schemas/user_ribbons.schema';

@Injectable()
export class UserRibbonsRepository extends AbstractRepository<UserRibbons> {
  protected readonly logger = new Logger(UserRibbonsRepository.name);

  constructor(
    @InjectModel(UserRibbons.name) UserRibbonsModel: Model<UserRibbons>,
    @InjectConnection() connection: Connection,
  ) {
    super(UserRibbonsModel, connection);
  }
}
