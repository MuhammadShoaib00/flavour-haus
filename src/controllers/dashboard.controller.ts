import { Controller, Get, Query, Logger, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role, EventTime } from '../shared/interfaces/role';
import { GetRecentActivtyResponse, GetUserCountResponse } from '../dto/user/getUserCount.dto';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { RateHostResponseDto } from '../dto/booking';
import { CheckHostNotConfirmed } from '../shared/decorators/checkHostNotConfirmed';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { AdminUserService } from '../modules/user-account/services/admin-user.service';
import { UserService } from '../modules/user-profile/services/user.service';
import { UserAuditService } from '../modules/user-profile/services/user_audit.service';
import { BookingService } from '../modules/booking/services/booking.service';
import { CalendarService } from '../modules/calendar/services/calendar.service';
import { ListingService } from '../modules/listings/services/listing.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class AdminDashboardController {
  protected readonly logger = new Logger(AdminDashboardController.name);
  constructor(
    private adminUserService: AdminUserService,
    private userService: UserService,
    private userAuditService: UserAuditService,
    private bookingService: BookingService,
    private calendarService: CalendarService,
    private listingService: ListingService,
  ) {}

  @Get('admin/get-usercount-and-activity')
  @ApiRoute.LIST({ name: 'Get Activity', description: 'Get Recent Activity', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: GetUserCountResponse })
  async getUserCountbyStatus(@Req() { user: { userId } }) {
    let reminders = await this.calendarService.getAdminReminder({ userId });
    let data = await this.adminUserService.getUserCountbyStatus({});
    (data.data as any).reminders = reminders;
    return data;
  }

  @Get('admin/get-all-auditlog')
  @ApiRoute.LIST({ name: 'Get Auditlog', description: 'Get Audit Logs', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: GetRecentActivtyResponse })
  @ApiQuery({ name: 'accountType', enum: Role, required: false })
  @ApiQuery({ name: 'eventName', type: 'string', required: false })
  @ApiQuery({ name: 'eventDate', type: 'string', required: false })
  @ApiQuery({ name: 'eventTime', enum: EventTime, required: false })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  async getallauditlog(
    @Query('accountType') accountType: string,
    @Query('eventName') eventName: string,
    @Query('eventDate') eventDate: string,
    @Query('eventTime') eventTime: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    let data: any = { eventName, eventDate, eventTime };
    Object.keys(data).forEach((key) => { if (!data[key]) delete data[key]; });
    return await this.adminUserService.getalllogs({ data, limit, offset });
  }

  @CheckHostNotConfirmed()
  @Get('host/dashboard-detail')
  @ApiRoute.LIST({ name: 'Get Details', description: 'Get Admin Dashboard Details', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: RateHostResponseDto })
  async dashboardDetail(@Req() { user: { userId } }) {
    const listingCount = await this.listingService.getListingCount({ userId });
    let hostData = await this.bookingService.getdashboardData({ userId });
    (hostData as any).ListingCount = listingCount;
    return hostData;
  }

  @Get('compliance-officer')
  @ApiRoute.LIST({ name: 'Complince Officer Dashboard', description: 'Get Compliance Officer Dashboard', roles: [Role.CMP_OFFICER] })
  @ApiCreatedResponse({})
  async complianceOfficerDashboard(@Req() { user: { userId } }) {
    const widgets_data = await this.userService.getComplianceDashboard({ userId });
    const { audits } = await this.userAuditService.getAssignedAudits({ auditorId: userId, offset: 0, limit: 10 });
    return { errors: null, message: 'Dashboard Data', data: { widgets_data, audits } };
  }
}
