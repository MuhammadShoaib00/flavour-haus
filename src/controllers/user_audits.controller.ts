import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Logger,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import {
  AssignUsersForAuditRequest,
  AssignUsersForAuditResponse,
  GetUsersForAuditResponseDto,
  UserAuditChangeStatusDto,
  UserAuditChangeStatusResponse,
} from '../dto/user-audits/get-assign-user.dto';
import { UserAuditStatusEnumForCMPDto, UserAuditStatusEnum, UserAuditStatusEnumForDto, UserAuditTypeEnum } from '../shared/interfaces/user_audits/user-audit.enum';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { ListTrainingsDto } from '../dto/user/list-trainings.dto';
import { ListRibbonsResponseDto } from '../dto/user-ribbons';
import { getLicenseDetailResponseDto } from '../dto/user';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { UserAuditService } from '../modules/user-profile/services/user_audit.service';
import { UserService } from '../modules/user-profile/services/user.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';
import { HouseRulesService } from '../modules/user-profile/services/house-rules.service';
import { UserTrainingsService } from '../modules/user-profile/services/user_trainings.service';
import { UserRibbonsService } from '../modules/user-profile/services/user_ribbons.service';
import { NestJsNotification } from '../modules/notifications/services/nestjs-notification.service';
import { InitialAuditsNotification } from '../modules/notifications/notifications/CMP_OFFICER/inital-audits.notification';
import { HostConfirmedNotification } from '../modules/notifications/notifications/HOST/host-confirmed.notification';

@ApiTags('User Audits')
@Controller('user-audits')
export class UserAuditController {
  private readonly logger = new Logger(UserAuditController.name);
  constructor(
    private userAuditService: UserAuditService,
    private userService: UserService,
    private kitchenService: KitchenService,
    private houseRulesService: HouseRulesService,
    private userTrainingsService: UserTrainingsService,
    private userRibbonsService: UserRibbonsService,
    private sendNotification: NestJsNotification,
  ) {}

  @Get('initial-audits')
  @ApiRoute.LIST({ name: 'Search Audits', description: 'Get Hosts to be Audited', roles: [Role.SYS_ADMIN] })
  @ApiQuery({ name: 'hostId', type: String, required: false })
  @ApiQuery({ name: 'auditorId', type: String, required: false })
  @ApiQuery({ name: 'longitude', type: Number, required: false })
  @ApiQuery({ name: 'latitude', type: Number, required: false })
  @ApiQuery({ name: 'createdAt', type: String, required: false, example: '1/2/2023' })
  @ApiQuery({ name: 'status', enum: UserAuditStatusEnumForCMPDto, type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'assigned', type: Boolean, required: false })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiCreatedResponse({ type: GetUsersForAuditResponseDto })
  async getInitialAudits(@Req() { user: { userId, defaultRole } }, @Query() queryParams: any) {
    const { assigned, limit, offset, search, hostId, auditorId, createdAt, latitude, longitude, status } = queryParams;
    let auditHostId;
    if (hostId) auditHostId = await this.checkAuditorAccess(hostId, userId, defaultRole);
    return await this.userAuditService.getAssignableAudits({ auditType: UserAuditTypeEnum.INITIAL_VISIT, assigned, limit, offset, search, hostId: auditHostId, auditorId, createdAt, latitude, longitude, status });
  }

  @Get('unannounced-audits')
  @ApiRoute.LIST({ name: 'Unannounced Audits', description: 'Get Hosts to be Audited', roles: [Role.SYS_ADMIN] })
  @ApiQuery({ name: 'hostId', type: String, required: false })
  @ApiQuery({ name: 'auditorId', type: String, required: false })
  @ApiQuery({ name: 'longitude', type: Number, required: false })
  @ApiQuery({ name: 'latitude', type: Number, required: false })
  @ApiQuery({ name: 'createdAt', type: String, required: false, example: '1/2/2023' })
  @ApiQuery({ name: 'status', enum: UserAuditStatusEnumForCMPDto, type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiCreatedResponse({ type: GetUsersForAuditResponseDto })
  async getUnannouncedAudits(@Req() { user: { userId, defaultRole } }, @Query() queryParams: any) {
    const { limit, offset, search, hostId, auditorId, createdAt, latitude, longitude, status } = queryParams;
    let auditHostId;
    if (hostId) auditHostId = await this.checkAuditorAccess(hostId, userId, defaultRole);
    return await this.userAuditService.getAssignableAudits({ auditType: UserAuditTypeEnum.UNANNOUNCED_VISIT, limit, offset, search, hostId: auditHostId, auditorId, createdAt, latitude, longitude, status });
  }

  @Get('announced-audits')
  @ApiRoute.LIST({ name: 'announced Audits', description: 'Get Hosts to be Audited', roles: [Role.SYS_ADMIN] })
  @ApiQuery({ name: 'hostId', type: String, required: false })
  @ApiQuery({ name: 'auditorId', type: String, required: false })
  @ApiQuery({ name: 'longitude', type: Number, required: false })
  @ApiQuery({ name: 'latitude', type: Number, required: false })
  @ApiQuery({ name: 'createdAt', type: String, required: false, example: '1/2/2023' })
  @ApiQuery({ name: 'status', enum: UserAuditStatusEnumForCMPDto, type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiCreatedResponse({ type: GetUsersForAuditResponseDto })
  async getAnnouncedAudits(@Req() { user: { userId, defaultRole } }: any, @Query() queryParams: any) {
    const { limit, offset, search, hostId, auditorId, createdAt, latitude, longitude, status } = queryParams;
    let auditHostId;
    if (hostId) auditHostId = await this.checkAuditorAccess(hostId, userId, defaultRole);
    return await this.userAuditService.getAssignableAudits({ auditType: UserAuditTypeEnum.ANNOUNCED_VISIT, limit, offset, search, hostId: auditHostId, auditorId, createdAt, latitude, longitude, status });
  }

  @Get('get-hosts-for-audits')
  @ApiRoute.LIST({ name: 'Get Host', description: 'Get Hosts For Audits', roles: [Role.SYS_ADMIN] })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'auditType', enum: UserAuditTypeEnum, type: String, required: false })
  async getHosts(@Query('search') search: string, @Query('auditType') auditType: UserAuditTypeEnum) {
    try {
      return await this.userAuditService.getHosts({ search, auditType });
    } catch (e) {
      return { data: null, message: null, errors: [e.message] };
    }
  }

  @Get('get-cmp-officers')
  @ApiRoute.LIST({ name: 'Get CMP Officers', description: 'Get Compliance Officers', roles: [Role.SYS_ADMIN] })
  @ApiQuery({ name: 'search', type: String, required: false })
  async getComplianceOfficers(@Query('search') search: string) {
    try {
      const { complianceOfficers } = await this.userAuditService.getCmpOfficers({ cmp_role: Role.CMP_OFFICER, search });
      return { errors: null, data: { complianceOfficers }, message: 'Compliance Officers' };
    } catch (e) {
      return { data: null, message: null, errors: [e.message] };
    }
  }

  @Post('assign-initial-audits')
  @ApiRoute.UPDATE({ name: 'Assign Audits', description: 'Assign Initial Audits to Compliance Officer', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: AssignUsersForAuditResponse })
  async assignInitialAudits(@Body() dto: AssignUsersForAuditRequest) {
    try {
      const resp = await this.userAuditService.assignAudits({ ...dto, auditType: UserAuditTypeEnum.INITIAL_VISIT });
      if (resp.data.length > 0) {
        await this.sendNotification.send(new InitialAuditsNotification({ userId: dto.auditorId }));
      }
      return { data: resp, errors: null, message: 'Host(s) assigned for initial audit to compliance officer' };
    } catch (e) {
      return { data: null, message: null, errors: [e.message] };
    }
  }

  @Post('assign-announced-audits')
  @ApiRoute.UPDATE({ name: 'Assign Announce Audits', description: 'Assign Announced Audits to Compliance Officer', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: AssignUsersForAuditResponse })
  async assignAnnouncedAudits(@Body() dto: AssignUsersForAuditRequest) {
    try {
      const resp = await this.userAuditService.assignAudits({ ...dto, auditType: UserAuditTypeEnum.ANNOUNCED_VISIT });
      if (resp.data.length > 0) {
        await this.sendNotification.send(new InitialAuditsNotification({ userId: dto.auditorId }));
      }
      return { data: resp, errors: null, message: 'Host(s) assigned for announced audit to compliance officer' };
    } catch (e) {
      return { data: null, message: null, errors: [e.message] };
    }
  }

  @Post('assign-unannounced-audits')
  @ApiRoute.UPDATE({ name: 'Assign Unannounced Audits', description: 'Assign Unannounced Audits to Compliance Officer', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: AssignUsersForAuditResponse })
  async assignUnannouncedAudits(@Body() dto: AssignUsersForAuditRequest) {
    try {
      const resp = await this.userAuditService.assignAudits({ ...dto, auditType: UserAuditTypeEnum.UNANNOUNCED_VISIT });
      if (resp.data.length > 0) {
        await this.sendNotification.send(new InitialAuditsNotification({ userId: dto.auditorId }));
      }
      return { data: resp, errors: null, message: 'Host(s) assigned for unannounced audit to compliance officer' };
    } catch (e) {
      return { data: null, message: null, errors: [e.message] };
    }
  }

  @Get('')
  @ApiRoute.LIST({ name: 'Users Audtis', description: 'Get Users to be Audited', roles: [Role.CMP_OFFICER] })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'status', example: UserAuditStatusEnumForCMPDto.ALL, enum: UserAuditStatusEnumForCMPDto, required: false })
  @ApiCreatedResponse({ type: GetUsersForAuditResponseDto })
  async getAssignedAudits(@Req() { user: { userId } }, @Query('status') status: UserAuditStatusEnumForDto, @Query('limit') limit: number, @Query('offset') offset: number) {
    try {
      return await this.userAuditService.getAssignedAudits({ auditorId: userId, status, offset, limit });
    } catch (e) {
      return { data: null, message: null, errors: [e.message] };
    }
  }

  @Patch('')
  @ApiRoute.UPDATE({ name: 'Change Audits', description: 'Change Audit Status', roles: [Role.CMP_OFFICER] })
  @ApiCreatedResponse({ type: UserAuditChangeStatusResponse })
  async changeAuditStatus(@Req() { user }, @Body() dto: UserAuditChangeStatusDto) {
    const userId = user.userId;
    const resp = await this.userAuditService.changeAuditStatus({ ...dto, auditorId: userId });
    if (resp && resp.data?.confirmed && resp.data?.auditType == UserAuditTypeEnum.INITIAL_VISIT && resp.data?.status == UserAuditStatusEnum.COMPLETED) {
      const userProfile = await this.userService.getUserEssentials({ userId: resp.data.hostId });
      await this.sendNotification.send(new HostConfirmedNotification({
        userId: resp.data.hostId,
        email: userProfile.email,
        name: `${user.firstName} ${user.lastName}`,
        status: resp.data.status,
        auditType: resp.data.auditType,
      }));
    }
    return resp;
  }

  @Get(':auditId')
  @ApiRoute.LIST({ name: 'Get Audit', description: 'Get Audit Details', roles: [Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'auditId', type: String, example: '638a12f8ef2edd1c2fc3a934' })
  @ApiCreatedResponse({ type: GetUsersForAuditResponseDto })
  async getAuditDetails(@Param('auditId') auditId: string, @Req() { user: { userId, defaultRole } }) {
    const audit = await this.userAuditService.getSingleAudit({ filterQuery: { _id: auditId, ...(defaultRole !== Role.SYS_ADMIN ? { auditorId: userId } : {}) }, projection: {} });
    return { data: audit, message: null, errors: null };
  }

  @Get(':auditId/personal-kitchen-details')
  @ApiRoute.LIST({ name: 'Personal Kitchen Details', description: 'Personal/Kitchen Details to be Audited', roles: [Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'auditId', type: String, example: '638a12f8ef2edd1c2fc3a934' })
  async viewHostPersonalDetails(@Param('auditId') auditId: string, @Req() { user: { userId, defaultRole } }) {
    const hostId = await this.checkAuditorAccess(auditId, userId, defaultRole);
    const { data: userProfileData } = await this.userService.getUser({ userId: hostId });
    const { data: kitchenDetails } = await this.kitchenService.getKitchenDetails({ userId: hostId });
    const { data: foodIngredients } = await this.houseRulesService.listFoodIngredients({ userId: hostId, restricted: true });
    return {
      data: {
        personal: userProfileData,
        kitchen: { ...kitchenDetails, houseRules: { ...kitchenDetails.houseRules, restrictedFoods: [...foodIngredients] } },
      },
      message: null, errors: null,
    };
  }

  @Get(':auditId/id-verification-info')
  @ApiRoute.LIST({ name: 'Verification Status', description: "View Host's Verification Status", roles: [Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'auditId', type: String, example: '638a12f8ef2edd1c2fc3a934' })
  async viewHostVerificationStatus(@Param('auditId') auditId: string, @Req() { user: { userId, defaultRole } }) {
    const hostId = await this.checkAuditorAccess(auditId, userId, defaultRole);
    const dbs = await this.userService.getDBSInfo(hostId);
    return { data: { ...dbs }, message: 'ID Verification Info', errors: null };
  }

  @Get(':auditId/license-info')
  @ApiRoute.LIST({ name: 'Host License', description: 'Host License Info', roles: [Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'auditId', type: String, example: '638a12f8ef2edd1c2fc3a934' })
  @ApiCreatedResponse({ type: getLicenseDetailResponseDto })
  async viewHostLicense(@Param('auditId') auditId: string, @Req() { user: { userId, defaultRole } }) {
    const hostId = await this.checkAuditorAccess(auditId, userId, defaultRole);
    const dbsFile = await this.userService.getContractBookPdfLink({ userId: hostId });
    const license = await this.userService.getLicenseInfo(hostId);
    return { data: { ...license, dbs_pdf_file: dbsFile }, message: 'License Info', errors: null };
  }

  @Get(':auditId/trainings')
  @ApiRoute.LIST({ name: 'Trainings', description: 'Host trainings', roles: [Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'auditId', type: String, example: '638a12f8ef2edd1c2fc3a934' })
  @ApiCreatedResponse({ type: ListTrainingsDto })
  async viewHostTrainings(@Param('auditId') auditId: string, @Req() { user: { userId, defaultRole } }) {
    const hostId = await this.checkAuditorAccess(auditId, userId, defaultRole);
    const trainings = await this.userTrainingsService.listTrainings(hostId);
    return { data: trainings, message: 'Trainings', errors: null };
  }

  @Get(':auditId/ribbons')
  @ApiRoute.LIST({ name: 'Get Ribbons', description: 'Get Ribbons', roles: [Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'auditId', type: String, example: '638a12f8ef2edd1c2fc3a934' })
  @ApiCreatedResponse({ type: ListRibbonsResponseDto })
  async viewHostRibbons(@Param('auditId') auditId: string, @Req() { user: { userId, defaultRole } }) {
    const hostId = await this.checkAuditorAccess(auditId, userId, defaultRole);
    const { data: ribbons } = await this.userRibbonsService.listUserRibbons({ userId: hostId });
    return { data: ribbons, message: 'Ribbons', errors: null };
  }

  private async checkAuditorAccess(auditId: string, auditorId: string, defaultRole?: string) {
    const audit = await this.userAuditService.getSingleAudit({ filterQuery: { _id: auditId, ...(defaultRole !== Role.SYS_ADMIN ? { auditorId } : {}) }, projection: { _id: 1, auditorId: 1, hostId: 1 } });
    return audit.hostId;
  }
}
