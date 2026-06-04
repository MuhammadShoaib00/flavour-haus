import {
  Body,
  Controller,
  Get,
  Query,
  Logger,
  Req,
  Patch,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDescription } from '../shared/decorators/custom';
import { AuthN } from '../shared/decorators/authN.decorator';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { GetLatestUserNotificationsDto, GetUserNotificationsDto, ReadNotificationsRequest } from '../dto/user/user-notification.dto';
import { UserNotificationService } from '../modules/notifications/services/user-notification.service';

@ApiTags('User Notifications')
@Controller('user-notifications')
export class UserNotificationController {
  private readonly logger = new Logger(UserNotificationController.name);
  constructor(private notificationService: UserNotificationService) {}

  @AuthN()
  @Get('')
  @ApiCreatedResponse({ type: GetUserNotificationsDto })
  @ApiDescription('Get All Notfications')
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  async getAllNotifications(@Req() { user: { userId } }, @Query('limit') limit: number, @Query('offset') offset: number) {
    const data = await this.notificationService.getAllNotifications({ userId, offset, limit });
    return { errors: null, data, message: 'All Notifications' };
  }

  @AuthN()
  @Get('latest')
  @ApiCreatedResponse({ type: GetLatestUserNotificationsDto })
  @ApiDescription('Get Latest Notfications')
  async getLatestNotifications(@Req() { user: { userId } }) {
    const data = await this.notificationService.getLatestNotifications({ userId });
    return { errors: null, data, message: 'Latest Notifications' };
  }

  @AuthN()
  @Patch('read')
  @ApiDescription('Mark Notfications as read')
  async markSingleAsReadNotification(@Req() { user: { userId } }, @Body() dto: ReadNotificationsRequest) {
    await this.notificationService.readNotifications({ userId, method: 'single', notificationIds: dto.notificationIds });
    return { errors: null, data: null, message: 'Notification(s) have been marked as read' };
  }

  @AuthN()
  @Patch('read/all')
  @ApiDescription('Mark All Notfications as read')
  async markAllAsReadNotifications(@Req() { user: { userId } }) {
    await this.notificationService.readNotifications({ userId, method: 'all' });
    return { errors: null, data: null, message: 'All Notifications have been marked as read' };
  }

  @AuthN()
  @Patch('delete')
  @ApiDescription('Delete Notfication(s)')
  async deleteNotification(@Req() { user: { userId } }, @Body() dto: ReadNotificationsRequest) {
    await this.notificationService.deleteNotifications({ userId, method: 'single', notificationIds: dto.notificationIds });
    return { errors: null, data: null, message: 'Notification(s) have been deleted' };
  }

  @AuthN()
  @Patch('delete/all')
  @ApiDescription('Delete All Notfications')
  async deleteAllNotification(@Req() { user: { userId } }) {
    await this.notificationService.deleteNotifications({ userId, method: 'all' });
    return { errors: null, data: null, message: 'All Notifications have been deleted' };
  }

  @AuthN()
  @Patch('unread')
  @ApiDescription('Unread Notfication(s)')
  async unreadNotification(@Req() { user: { userId } }, @Body() dto: ReadNotificationsRequest) {
    await this.notificationService.unreadNotifications({ userId, method: 'single', notificationIds: dto.notificationIds });
    return { errors: null, data: null, message: 'Notification(s) have been marked as unread' };
  }

  @AuthN()
  @Patch('unread/all')
  @ApiDescription('Unread All Notfications')
  async unreadAllNotification(@Req() { user: { userId } }) {
    await this.notificationService.unreadNotifications({ userId, method: 'all' });
    return { errors: null, data: null, message: 'All Notifications have been marked as unread' };
  }
}
