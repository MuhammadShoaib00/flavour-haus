import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Webhook } from '../schemas/webhook.schema';

@Injectable()
export class WebhookRepository extends AbstractRepository<Webhook> {
  protected readonly logger = new Logger(WebhookRepository.name);

  constructor(
    @InjectModel(Webhook.name) WebhookModel: Model<Webhook>,
    @InjectConnection() connection: Connection,
  ) {
    super(WebhookModel, connection);
  }
}
