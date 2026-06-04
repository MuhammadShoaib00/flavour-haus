import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListTrainingsDto } from '../dto/user/list-trainings.dto';
import {
  CreateUserTrainingDto,
  CreateUserTrainingResponseDto,
} from '../dto/user/create-user-trainings.dto';
import { Role } from '../shared/interfaces/role';
import { CheckHostNotConfirmed } from '../shared/decorators/checkHostNotConfirmed';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { UserTrainingsService } from '../modules/user-profile/services/user_trainings.service';

@ApiTags('User Trainings')
@Controller('user-trainings')
export class UserTrainingsController {
  protected readonly logger = new Logger(UserTrainingsController.name);
  constructor(private userTrainingsService: UserTrainingsService) {}

  @CheckHostNotConfirmed()
  @ApiOkResponse({ type: ListTrainingsDto })
  @Get()
  @ApiRoute.LIST({
    name: 'All Tranings',
    description: 'Get All Trainings',
    roles: [Role.HOST],
  })
  async list(@Req() req): Promise<any> {
    return await this.userTrainingsService.listTrainings(req.user.userId);
  }

  @CheckHostNotConfirmed()
  @ApiCreatedResponse({ type: CreateUserTrainingResponseDto })
  @Post('mark-completed')
  @ApiRoute.UPDATE({
    name: 'Training Mark',
    description: 'Marked Training as Done',
    roles: [Role.HOST],
  })
  async markAsCompleted(@Req() req, @Body() dto: CreateUserTrainingDto): Promise<any> {
    return await this.userTrainingsService.markAsCompleted({ userId: req.user.userId, ...dto });
  }
}
