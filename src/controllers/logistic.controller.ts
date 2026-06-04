import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import { menuDTO } from '../dto/logistic/logistic.menu.dto';
import { recipeDTO } from '../dto/logistic/logistic.recipe.dto';
import { shoppingListDTO } from '../dto/logistic/logistic.shoppinglist';
import { houseRulesOrFacilitiesDTO } from '../dto/logistic/logistic.houserule.facilities.dto';
import { houseCleanlinessDTO } from '../dto/logistic/logistic.housecleanliness.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { logisticTimerDTO } from '../dto/logistic/logistic.timer.dto';
import { LogisticService } from '../modules/booking/services/logistic.service';

@ApiTags('logistics')
@Controller('logistics')
export class LogisticController {
  protected readonly logger = new Logger();
  constructor(private logisticService: LogisticService) {}

  @Get(':bookingId')
  @ApiRoute.LIST({
    name: 'Logistics',
    description: 'Create and find logistic tracker',
    roles: [Role.HOST],
  })
  @ApiOkResponse({})
  @ApiParam({ name: 'bookingId', type: String })
  async findOrCreateLogisticTracker(@Param('bookingId') bookingId: string) {
    const logisticTracker = await this.logisticService.viewOfCreateLogisticTracker({ bookingId });
    return {
      data: logisticTracker,
      message: 'Logistic tracker created or found successfully',
      errors: null,
    };
  }

  @Patch('/menu/:bookingId')
  @ApiRoute.UPDATE({
    name: 'Logistic',
    description: 'Logistic menu updated',
    roles: [Role.HOST],
  })
  async updateMenuLogistic(
    @Param('bookingId') bookingId: string,
    @Body() menuBody: menuDTO,
  ) {
    const updateLogistic = await this.logisticService.updateLogisticTracker({ bookingId, logisticBody: menuBody });
    return { data: updateLogistic, message: 'Logistic tracker updated successfully', errors: null };
  }

  @Patch('/recipe/:bookingId')
  @ApiRoute.UPDATE({
    name: 'Logistic',
    description: 'Logistic recipe updated',
    roles: [Role.HOST],
  })
  async updateRecipeLogistic(
    @Param('bookingId') bookingId: string,
    @Body() recipeBody: recipeDTO,
  ) {
    const updateLogistic = await this.logisticService.updateLogisticTracker({ bookingId, logisticBody: recipeBody });
    return { data: updateLogistic, message: 'Logistic tracker updated successfully', errors: null };
  }

  @Patch('/shopping-list/:bookingId')
  @ApiRoute.UPDATE({
    name: 'Logistic',
    description: 'Logistic shopping list updated',
    roles: [Role.HOST],
  })
  async updateShoppingListLogistic(
    @Param('bookingId') bookingId: string,
    @Body() shoppingList: shoppingListDTO,
  ) {
    const updateLogistic = await this.logisticService.updateLogisticTracker({ bookingId, logisticBody: shoppingList });
    return { data: updateLogistic, message: 'Logistic tracker updated successfully', errors: null };
  }

  @ApiRoute.UPDATE({
    name: 'Logsitic',
    description: 'Logistic house rules updated',
    roles: [Role.HOST],
  })
  @Patch('/facilities-or-house-rules/:bookingId')
  async updateFacilitiesOrHouseRuleLogistic(
    @Param('bookingId') bookingId: string,
    @Body() facilitiesOrHouseRule: houseRulesOrFacilitiesDTO,
  ) {
    const updateLogistic = await this.logisticService.updateLogisticTracker({ bookingId, logisticBody: facilitiesOrHouseRule });
    return { data: updateLogistic, message: 'Logistic tracker updated successfully', errors: null };
  }

  @ApiRoute.UPDATE({
    name: 'Logistic',
    description: 'Logistic house cleanliness updated',
    roles: [Role.HOST],
  })
  @Patch('/house-cleanliness/:bookingId')
  async updateHouseCleanlinessLogistic(
    @Param('bookingId') bookingId: string,
    @Body() houseCleanliness: houseCleanlinessDTO,
  ) {
    const updateLogistic = await this.logisticService.updateLogisticTracker({ bookingId, logisticBody: houseCleanliness });
    return { data: updateLogistic, message: 'Logistic tracker updated successfully', errors: null };
  }

  @Patch('/timer/:bookingId')
  @ApiRoute.UPDATE({
    name: 'Logistic Update',
    description: 'Logistic Update Description',
    roles: [Role.HOST],
  })
  async updateLogisticTimerTracker(
    @Param('bookingId') bookingId: string,
    @Body() logisticTimer: logisticTimerDTO,
  ) {
    const updateLogistic = await this.logisticService.updateLogisticTracker({ bookingId, logisticBody: logisticTimer });
    return { data: updateLogistic, message: 'Logistic tracker updated successfully', errors: null };
  }
}
