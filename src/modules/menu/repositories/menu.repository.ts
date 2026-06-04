import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Menu } from '../schemas/menu.schema';
import {AbstractRepository} from "../shared/class/abstract.repository";

@Injectable()
export class MenuRepository extends AbstractRepository<Menu> {
  protected readonly logger = new Logger(MenuRepository.name);

  constructor(
    @InjectModel(Menu.name) menuModel: Model<Menu>,
    @InjectConnection() connection: Connection,
  ) {
    super(menuModel, connection);
  }
}
