import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Facility } from '../schemas/facilities.schema';

@Injectable()
export class FacilityRepository extends AbstractRepository<Facility> {
  protected readonly logger = new Logger(FacilityRepository.name);

  constructor(
    @InjectModel(Facility.name) facilityModel: Model<Facility>,
    @InjectConnection() connection: Connection,
  ) {
    super(facilityModel, connection);
  }
}
