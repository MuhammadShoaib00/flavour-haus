import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Role } from '../shared/interfaces/role';
import { PageLimitDto, PageOffsetDto, PageLimitDtoReview } from '../dto/common/PageLimitOffset.dto';
import { BookingStatus } from '../shared/interfaces/booking/booking-status.enum';
import {
  CancelBookingRequestDto,
  CancelBookingResponseDto,
  CompleteBookingResponseDto,
  ConfirmBookingResponseDto,
  GetBookingDetailsResponseDto,
  RejectBookingRequestDto,
  RejectBookingResponseDto,
  SendBookingRequestRequestDto,
  SendBookingRequestResponseDto,
  RateGuestRequestDto,
  RateHostRequestDto,
  RateGuestResponseDto,
  RateHostResponseDto,
  RatingResponseDto,
} from '../dto/booking';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { BookingService } from '../modules/booking/services/booking.service';
import { MenuService } from '../modules/menu/services/menu.service';
import { ListingService } from '../modules/listings/services/listing.service';
import { CalendarService } from '../modules/calendar/services/calendar.service';

const DUMMY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMoAAADPCAYAAAC0qE4bAAAA';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  protected readonly logger = new Logger(BookingsController.name);

  constructor(
    private menuService: MenuService,
    private bookingService: BookingService,
    private listingService: ListingService,
    private calendarService: CalendarService,
  ) {}

  @Get()
  @ApiRoute.LIST({ name: 'All Bookings', description: 'Get Bookings', roles: [Role.SYS_ADMIN, Role.GUEST, Role.HOST] })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'status', enum: BookingStatus })
  @ApiQuery({ name: 'search', type: String, description: 'Search by Title, BookingID, Name or Email', required: false })
  @ApiQuery({ name: 'from', type: Date, description: 'date starting from', required: false })
  @ApiQuery({ name: 'to', type: Date, description: 'date ending to', required: false })
  @ApiQuery({ name: 'rated', type: Boolean, required: false })
  @ApiQuery({ name: 'hostId', type: String, required: false, example: 'cb59cbdf-fa0a-41c3-8590-99118409b4c1' })
  @ApiOkResponse({})
  async list(
    @Req() { user: { userId, defaultRole } },
    @Query() query: { limit: number; offset: number; from: string; to: string; search: string; status: string; rated: boolean; hostId?: string },
  ) {
    const { limit, offset, from, to, search, status, rated, hostId } = query;
    return await this.bookingService.listBookings({
      userId,
      userRole: defaultRole,
      limit,
      offset,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      search,
      status: status as BookingStatus | 'ALL',
      rated: rated === undefined ? undefined : String(rated),
      hostId,
    });
  }

  @Get('myrating')
  @ApiRoute.LIST({ name: 'My Ratings', description: 'Get My Ratings', roles: [Role.GUEST, Role.HOST] })
  @ApiQuery({ name: 'findstar', type: 'integer', required: false })
  @ApiQuery({ name: 'latest', type: 'boolean', required: false })
  @ApiCreatedResponse({ type: RatingResponseDto })
  async myrating(
    @Query('findstar') findstar: number,
    @Query('latest') latest: boolean,
    @Req() { user: { userId, defaultRole, totalReview, avgRating } },
  ) {
    return await this.bookingService.myRating({ findstar, latest, user: { userId, defaultRole, avgRating, totalReview } });
  }

  @Get(':bookingId/my-rating')
  @ApiRoute.LIST({ name: 'Raing in Booking', description: 'Get My Ratings in Booking', roles: [Role.GUEST, Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: false })
  @ApiCreatedResponse({ type: RatingResponseDto })
  async myRatingByBooking(@Param('bookingId') bookingId: string, @Req() { user: { userId, defaultRole } }) {
    return await this.bookingService.myRatingByBooking({ defaultRole, userId, bookingId });
  }

  @Get(':bookingId/get-rating')
  @ApiRoute.LIST({ name: 'Raing in Booking', description: 'Get Ratings in Booking', roles: [Role.GUEST, Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: false })
  @ApiCreatedResponse({ type: RatingResponseDto })
  async getRatingByBooking(@Param('bookingId') bookingId: string, @Req() { user: { userId, defaultRole } }) {
    return await this.bookingService.getRatingByBooking({ defaultRole, userId, bookingId });
  }

  @Get('getrating')
  @ApiRoute.LIST({ name: 'Ratings', description: 'Get Ratings', roles: [Role.GUEST, Role.HOST, Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiQuery({ name: 'userId', type: String })
  @ApiQuery({ name: 'limit', type: PageLimitDtoReview })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiCreatedResponse({ type: RatingResponseDto })
  async getrating(
    @Query('userId') finduserId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() { user: { userId } },
  ) {
    try {
      return await this.bookingService.getRating({ finduserId, userId, limit, offset });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get(':bookingId')
  @ApiRoute.LIST({ name: 'Booking', description: 'Get Booking', roles: [Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({ type: GetBookingDetailsResponseDto })
  async getBooking(@Req() { user: { userId, defaultRole } }, @Param('bookingId') bookingId: Types.ObjectId) {
    return await this.bookingService.getBooking({ userId, userRole: defaultRole, bookingId });
  }

  @Get(':bookingId/view')
  @ApiRoute.LIST({ name: 'Booking Details', description: 'View Booking Details', roles: [Role.GUEST, Role.HOST, Role.SYS_ADMIN] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({ type: GetBookingDetailsResponseDto })
  async viewBookingDetails(@Req() { user: { userId, defaultRole } }, @Param('bookingId') bookingId: Types.ObjectId) {
    return await this.bookingService.viewBookingDetails({ userId, userRole: defaultRole, bookingId });
  }

  @Post('send-booking-request')
  @ApiRoute.UPDATE({ name: 'Booking Request', description: 'Booking Send Request', roles: [Role.GUEST] })
  @ApiCreatedResponse({ type: SendBookingRequestResponseDto })
  async sendBookingRequest(
    @Req() { user: { userId, firstName, lastName, profileImage, email } },
    @Body() dto: SendBookingRequestRequestDto,
  ) {
    if (dto.noOfGuests.adults <= 0) {
      return new BadRequestException({ data: null, message: 'No. of adults should be greater than 0', errors: [] });
    }
    const listing = await this.listingService.getSingleListing({ listingId: dto.listingId });
    if (!listing.data) {
      return { data: null, message: 'Invalid Listing.', errors: [] };
    }
    if (Object.values(dto.noOfGuests).reduce((a, b) => a + b) > listing.data.noOfGuests) {
      return new BadRequestException({ data: null, message: "No. of Guests exceeded the Host's accommodation limit.", errors: [] });
    }
    return await this.bookingService.addBooking({
      listingId: listing.data._id,
      listingTitle: listing.data.name,
      kitchenId: listing.data.kitchen._id,
      menu: { id: listing.data.menu._id, title: listing.data.menu.category, description: listing.data.menu.description },
      foodItems: listing.data.menu.foodItems,
      host: { id: listing.data.host._id, profileImage: listing.data.host.profileImage, firstName: listing.data.host.firstName, lastName: listing.data.host.lastName, email: listing.data.host.email },
      guest: { id: userId, profileImage: profileImage || DUMMY_IMAGE, firstName, lastName, email },
      noOfGuests: { adults: dto.noOfGuests.adults, children: dto.noOfGuests.children, infants: dto.noOfGuests.infants },
      selectedTiming: { date: dto.date, timeRange: { startTime: dto.timeRange.startTime, endTime: dto.timeRange.endTime } },
      specialInstructions: dto.specialInstructions,
      pricePerGuest: listing.data.price,
      timings: listing.data.timings,
      totalPrice: listing.data.price * dto.noOfGuests.adults,
    });
  }

  @Patch(':bookingId/accept')
  @ApiRoute.UPDATE({ name: 'Booking Accept', description: 'Booking Accept', roles: [Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({})
  async acceptBooking(@Req() { user: { userId } }, @Param('bookingId') bookingId: Types.ObjectId): Promise<any> {
    return await this.bookingService.acceptBooking({ userId, bookingId });
  }

  @Patch(':bookingId/reject')
  @ApiRoute.UPDATE({ name: 'Reject Booking', description: 'Booking Reject', roles: [Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({ type: RejectBookingResponseDto })
  async rejectBooking(@Req() { user: { userId } }, @Param('bookingId') bookingId: Types.ObjectId, @Body() dto: RejectBookingRequestDto): Promise<any> {
    return await this.bookingService.rejectBooking({ userId, bookingId, ...dto });
  }

  @Patch(':bookingId/confirm')
  @ApiRoute.UPDATE({ name: 'confirm Booking', description: 'Booking Confirm', roles: [Role.GUEST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({ type: ConfirmBookingResponseDto })
  async confirmBooking(@Req() { user: { userId } }, @Param('bookingId') bookingId: Types.ObjectId) {
    const booking = await this.bookingService.confirmBooking({ userId, bookingId });
    const { host, guest, selectedTiming, listingTitle } = booking?.data;
    await this.calendarService.addCalendarBooking({
      bookingId, hostId: host?.id, guestId: guest?.id,
      title: listingTitle, date: selectedTiming?.date,
      start: selectedTiming?.timeRange?.startTime,
      end: selectedTiming?.timeRange?.endTime,
    });
    const foodIds = booking.data.foodItems.map((i: any) => i._id);
    await this.menuService.incrementFoodItems(foodIds);
    return booking;
  }

  @Patch(':bookingId/cancel')
  @ApiRoute.UPDATE({ name: 'cancel Booking', description: 'Booking Cancel', roles: [Role.GUEST, Role.SYS_ADMIN] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({ type: CancelBookingResponseDto })
  async cancelBooking(@Req() { user: { userId, defaultRole } }, @Param('bookingId') bookingId: Types.ObjectId, @Body() dto: CancelBookingRequestDto): Promise<any> {
    return await this.bookingService.cancelBooking({ userId, defaultRole, bookingId, ...dto });
  }

  @Patch(':bookingId/complete')
  @ApiRoute.UPDATE({ name: 'Complete Booking', description: 'Booking Complete', roles: [Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiOkResponse({ type: CompleteBookingResponseDto })
  async completeBooking(@Req() { user: { userId } }, @Param('bookingId') bookingId: Types.ObjectId): Promise<any> {
    return await this.bookingService.completeBooking({ userId, bookingId });
  }

  @Post(':bookingId/rate-guest')
  @ApiRoute.UPDATE({ name: 'Rating', description: 'Rate Guest', roles: [Role.HOST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiCreatedResponse({ type: RateGuestResponseDto })
  async rateGuest(@Body() dto: RateGuestRequestDto, @Param('bookingId') bookingId: string, @Req() { user: { userId, profileImage, firstName, lastName } }) {
    return await this.bookingService.rateGuest({ dto, bookingId, user: { userId, profileImage, firstName, lastName } });
  }

  @Post(':bookingId/rate-host')
  @ApiRoute.UPDATE({ name: 'Rate Host', description: 'Rate Host', roles: [Role.GUEST] })
  @ApiParam({ name: 'bookingId', type: String, required: true })
  @ApiCreatedResponse({ type: RateHostResponseDto })
  async ratehost(@Body() dto: RateHostRequestDto, @Param('bookingId') bookingId: Types.ObjectId, @Req() { user: { userId, profileImage, firstName, lastName } }) {
    return await this.bookingService.rateHost({ dto, bookingId, user: { userId, profileImage, firstName, lastName } });
  }
}
