import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Logger,
  Req,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiDescription } from '../shared/decorators/custom';
import {
  AddCalendarReminderRequestDto,
  AddCalendarReminderResponseDto,
  GetCalendarEventsResponseDto,
} from '../dto/calendar';
import { AuthN } from '../shared/decorators/authN.decorator';
import { Role } from '../shared/interfaces/role';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { CalendarService } from '../modules/calendar/services/calendar.service';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);
  constructor(private calendarService: CalendarService) {}

  @ApiRoute.LIST({
    name: 'Calendar Reminders Admin',
    description: 'View Calendar Reminders For Admin',
    roles: [Role.SYS_ADMIN],
  })
  @Get('reminders/:userId')
  @ApiParam({
    name: 'userId',
    required: true,
    example: '35121b85-6005-473d-afb9-1f3e3e3f42c1',
  })
  @ApiQuery({
    name: 'title',
    required: false,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetCalendarEventsResponseDto,
  })
  async getCalendarEventsForAdmin(
    @Param('userId') userId: string,
    @Query('title') title?: string,
  ) {
    return await this.calendarService.getCalendarEvents({ userId, title });
  }

  @AuthN()
  @Get('reminders')
  @ApiDescription('View Calendar Reminders')
  @ApiQuery({
    name: 'title',
    required: false,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetCalendarEventsResponseDto,
  })
  async getCalendarEvents(
    @Req() { user: { userId } },
    @Query('title') title?: string,
  ) {
    return await this.calendarService.getCalendarEvents({ userId, title });
  }

  @AuthN()
  @Post('add-reminder')
  @ApiDescription('Add Calendar Reminder')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: AddCalendarReminderResponseDto,
  })
  async addCalendarReminder(
    @Req() { user: { userId } },
    @Body() dto: AddCalendarReminderRequestDto,
  ) {
    return await this.calendarService.addCalendarReminder({ ...dto, userId });
  }
}
