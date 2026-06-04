import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Invoice } from '../schemas/invoice.schema';

@Injectable()
export class InvoiceRepository extends AbstractRepository<Invoice> {
  protected readonly logger = new Logger(InvoiceRepository.name);

  constructor(
    @InjectModel(Invoice.name)
    invocieModel: Model<Invoice>,
    @InjectConnection() connection: Connection,
  ) {
    super(invocieModel, connection);
  }
}
