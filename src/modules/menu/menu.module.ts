import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuService } from './services/menu.service';
import { MenuRepository } from './repositories/menu.repository';
import { FoodRepository } from './repositories/food.repository';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { FoodSchema } from './schemas/food.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: 'fooditems', schema: FoodSchema },
    ]),
  ],
  providers: [MenuService, MenuRepository, FoodRepository],
  exports: [MenuService],
})
export class MenuModule {}
