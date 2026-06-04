import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ListRibbonsResponseDto,
  AddRibbonRequestDto,
  AddRibbonResponseDto,
} from '../dto/user-ribbons';
import { CheckHostNotConfirmed } from '../shared/decorators/checkHostNotConfirmed';
import { Role } from '../shared/interfaces/role';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { UserRibbonsService } from '../modules/user-profile/services/user_ribbons.service';

@ApiTags('User Ribbons')
@Controller('user-ribbons')
export class UserRibbonsController {
  protected readonly logger = new Logger(UserRibbonsController.name);
  constructor(private userRibbonsService: UserRibbonsService) {}

  @CheckHostNotConfirmed()
  @Get()
  @ApiRoute.LIST({
    name: 'GET_Ribbons',
    description: 'Get All Ribbons',
    roles: [Role.HOST],
  })
  @ApiOkResponse({ type: ListRibbonsResponseDto })
  async listRibbons(@Req() req) {
    return await this.userRibbonsService.listUserRibbons({ userId: req.user.userId });
  }

  @Post()
  @ApiRoute.UPDATE({
    name: 'Create Ribbons',
    description: 'Create Ribbon',
    roles: [Role.HOST],
  })
  @CheckHostNotConfirmed()
  @ApiCreatedResponse({ type: AddRibbonResponseDto })
  async createRibbon(@Req() req, @Body() dto: AddRibbonRequestDto) {
    return await this.userRibbonsService.addRibbon({ userId: req.user.userId, ...dto });
  }
}
