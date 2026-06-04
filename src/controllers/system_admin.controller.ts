import {
  Controller,
  Get,
  Logger,
  Param,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import { ListTrainingsDto } from '../dto/user/list-trainings.dto';
import { ListRibbonsResponseDto } from '../dto/user-ribbons';
import { getLicenseDetailResponseDto } from '../dto/user';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { UserService } from '../modules/user-profile/services/user.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';
import { HouseRulesService } from '../modules/user-profile/services/house-rules.service';
import { UserTrainingsService } from '../modules/user-profile/services/user_trainings.service';
import { UserRibbonsService } from '../modules/user-profile/services/user_ribbons.service';

@ApiTags('System Admin')
@Controller('system-admin')
export class SystemAdminController {
  private readonly logger = new Logger(SystemAdminController.name);
  constructor(
    private userService: UserService,
    private kitchenService: KitchenService,
    private houseRulesService: HouseRulesService,
    private userTrainingsService: UserTrainingsService,
    private userRibbonsService: UserRibbonsService,
  ) {}

  @Get('user/:userId/personal-kitchen-details')
  @ApiRoute.LIST({ name: 'Personal Kitchen Details', description: 'Personal/Kitchen Details', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', type: String, example: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1' })
  async viewHostPersonalDetails(@Param('userId') userId: string) {
    const { data: userProfileData } = await this.userService.getUser({ userId });
    const { data: kitchenDetails } = await this.kitchenService.getKitchenDetails({ userId });
    const { data: foodIngredients } = await this.houseRulesService.listFoodIngredients({ userId, restricted: true });
    return {
      data: {
        personal: userProfileData,
        kitchen: { ...kitchenDetails, houseRules: { ...kitchenDetails.houseRules, restrictedFoods: [...foodIngredients] } },
      },
      message: null,
      errors: null,
    };
  }

  @Get('user/:userId/id-verification-info')
  @ApiRoute.LIST({ name: "Host's Verification Status", description: "Host's Verification Status", roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', type: String, example: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1' })
  async viewHostVerificationStatus(@Param('userId') userId: string) {
    const dbs = await this.userService.getDBSInfo(userId);
    return { data: { ...dbs }, message: 'ID Verification Info', errors: null };
  }

  @Get('user/:userId/license-info')
  @ApiRoute.LIST({ name: 'Host License', description: 'Host License Info', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', type: String, example: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1' })
  @ApiCreatedResponse({ type: getLicenseDetailResponseDto })
  async viewHostLicense(@Param('userId') userId: string) {
    const dbsFile = await this.userService.getContractBookPdfLink({ userId });
    const license = await this.userService.getLicenseInfo(userId);
    return { data: { ...license, dbs_pdf_file: dbsFile }, message: 'License Info', errors: null };
  }

  @Get('user/:userId/trainings')
  @ApiRoute.LIST({ name: 'Trainings', description: 'Host Trainings', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', type: String, example: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1' })
  @ApiCreatedResponse({ type: ListTrainingsDto })
  async viewHostTrainings(@Param('userId') userId: string) {
    const trainings = await this.userTrainingsService.listTrainings(userId);
    return { data: trainings, message: 'Trainings', errors: null };
  }

  @Get('user/:userId/ribbons')
  @ApiRoute.LIST({ name: 'Get Ribbons', description: 'Get Ribbons', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', type: String, example: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1' })
  @ApiCreatedResponse({ type: ListRibbonsResponseDto })
  async viewHostRibbons(@Param('userId') userId: string) {
    const { data: ribbons } = await this.userRibbonsService.listUserRibbons({ userId });
    return { data: ribbons, message: 'Ribbons', errors: null };
  }
}
