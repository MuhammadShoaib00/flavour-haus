import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import {
  ChangingListingsRequest,
  ChangingListingsResponse,
  CreateListingsRequest,
  CreateListingsResponse,
  DeletingListingsRequest,
  DeletingListingsResponse,
  GetListingsResponse,
  GetSingleListingsResponse,
  UpdatingListingsRequest,
  UpdatingListingsResponse,
} from '../dto/user/listings.dto';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { CheckHostConfirmed } from '../shared/decorators/checkHostConfirmed';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { ListingService } from '../modules/listings/services/listing.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';
import { MenuService } from '../modules/menu/services/menu.service';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  protected readonly logger = new Logger(ListingsController.name);

  constructor(
    private listingService: ListingService,
    private kitchenService: KitchenService,
    private menuService: MenuService,
  ) {}

  @Get()
  @ApiRoute.LIST({ name: 'Searching_Items', description: 'search in name, description and food item names', roles: [Role.HOST, Role.SYS_ADMIN] })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'filter', type: String, required: false })
  @ApiQuery({ name: 'hostId', type: String, required: false })
  @ApiQuery({ name: 'listed', type: Boolean, required: false })
  @ApiCreatedResponse({ type: GetListingsResponse })
  async getListings(
    @Req() req,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('filter') search: string,
    @Query('hostId') hostId: string,
    @Query('listed') listed: boolean,
  ) {
    const listings = await this.listingService.getListings({ userId: req.user.userId, userRole: req.user.defaultRole, hostId, limit, offset, search, listed });
    return { data: listings, message: 'All Listings', errors: null };
  }

  @Get('by-host')
  @ApiRoute.LIST({ name: 'Listings_of_Host', description: 'Got Listings of Host', roles: [Role.GUEST] })
  @ApiQuery({ name: 'hostId', type: String, required: true })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'filter', type: String, description: 'Search in name, description and food item names', required: false })
  @ApiCreatedResponse({ type: GetListingsResponse })
  async getListingsByHost(
    @Query('hostId') hostId: any,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('filter') search: string,
  ) {
    const listings = await this.listingService.getListings({ hostId, limit, offset, search });
    return { data: listings, message: 'All Listings By Host', errors: null };
  }

  @Get(':listingId')
  @ApiRoute.LIST({ name: 'Listing', description: 'Got Listings of Host', roles: [Role.HOST] })
  @ApiParam({ name: 'listingId', required: true, type: 'string' })
  @ApiCreatedResponse({ type: GetSingleListingsResponse })
  async getListing(@Param('listingId') listingId: string) {
    return await this.listingService.getListing({ listingId });
  }

  @Get(':listingId/view')
  @ApiRoute.LIST({ name: 'Viewed_Listing', description: 'Get Viewed Listing', roles: [Role.HOST, Role.GUEST, Role.CMP_OFFICER, Role.SYS_ADMIN] })
  @ApiParam({ name: 'listingId', required: true, type: 'string' })
  @ApiCreatedResponse({ type: GetSingleListingsResponse })
  async viewListing(@Param('listingId') listingId: string) {
    return await this.listingService.getSingleListing({ listingId });
  }

  @Post()
  @ApiRoute.UPDATE({ name: 'Listing', description: 'Created Listing', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: CreateListingsResponse })
  async create(@Req() req, @Body() dto: CreateListingsRequest) {
    const { data } = await this.kitchenService.getKitchenDetails({ userId: req.user.userId });
    delete req.user.profileImage;
    const listing = await this.listingService.addListing({ dto: { ...dto, kitchenId: String(data.kitchenId) }, hostId: req.user.userId });
    return { data: listing, message: 'Listing created successfully.', errors: null };
  }

  @CheckHostConfirmed()
  @Put('change-listing-status')
  @ApiRoute.UPDATE({ name: 'UPDATE_Listing', description: 'Changed Listing Status', roles: [Role.HOST] })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: ChangingListingsResponse })
  async changeListingStatus(@Req() req, @Body() dto: ChangingListingsRequest) {
    try {
      const listing = await this.listingService.getListing({ listingId: String(dto.listingId) });
      await this.menuService.getMenuDetail({ userId: req.user.userId, menuId: String(listing.menuId) });
    } catch (e) {
      throw new BadRequestException('Status can not be changed, because menu not found!');
    }
    await this.listingService.changeListingStatus({ listingId: String(dto.listingId), hostId: req.user.userId, isListed: dto.isListed });
    return { data: null, message: 'Listing status changed successfully.', errors: null };
  }

  @Patch(':listingId')
  @ApiRoute.UPDATE({ name: 'Listing', description: 'Update Listing', roles: [Role.HOST] })
  @ApiParam({ name: 'listingId', required: true, type: 'string' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: UpdatingListingsResponse })
  async update(@Req() req, @Param('listingId') listingId: string, @Body() dto: UpdatingListingsRequest) {
    await this.listingService.updateListing({ dto: { listingId, ...dto }, hostId: req.user.userId });
    return { data: null, message: 'Listing updated successfully.', errors: null };
  }

  @Delete()
  @ApiRoute.DELETE({ name: 'Delete_Listing', description: 'Delete Listing', roles: [Role.HOST] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: DeletingListingsResponse })
  async delete(@Req() req, @Body() dto: DeletingListingsRequest) {
    await this.listingService.removeListing({ listingIds: dto.listingIds.map(String), hostId: req.user.userId });
    return { data: null, message: 'Listings deleted successfully.', errors: null };
  }
}
