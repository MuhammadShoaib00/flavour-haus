import {
  Controller,
  Get,
  Logger,
  Body,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import { ApiDescription } from '../shared/decorators/custom';
import {
  SearchByLocationRequest,
  SearchByLocationResponse,
  SearchByHostRequest,
  SearchByHostResponseDto,
  GetKitchenLocationDetailsResponse,
  SearchKitchenLocationsResponse,
  SearchByCuisineRequest,
} from '../dto/search';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { ListingService } from '../modules/listings/services/listing.service';
import { SearchService } from '../modules/user-profile/services/search.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';
import { MenuService } from '../modules/menu/services/menu.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  protected readonly logger = new Logger(SearchController.name);
  constructor(
    private listingService: ListingService,
    private searchService: SearchService,
    private kitchenService: KitchenService,
    private menuService: MenuService,
  ) {}

  @Post('by-location')
  @ApiRoute.UPDATE({ name: 'Search Location', description: 'Search Kitchen by Location', roles: [Role.GUEST] })
  @ApiOkResponse({ type: SearchByLocationResponse })
  async byLocation(@Body() dto: SearchByLocationRequest) {
    const kitchenIds = await this.listingService.searchListingByLocation(dto);
    const filteredKitchens = await this.searchService.searchByLocation(dto, kitchenIds);
    return { data: filteredKitchens, message: 'Search Success Perform' };
  }

  @Post('by-host')
  @ApiRoute.UPDATE({ name: 'Search Kitchen', description: 'Search Kitchen by Host', roles: [Role.GUEST] })
  @ApiOkResponse({ type: SearchByHostResponseDto })
  async byHost(@Body() dto: SearchByHostRequest) {
    const kitchenIds = await this.listingService.searchListingByLocation(dto);
    return await this.searchService.searchByHostkitchen({ dto, kitchenIds });
  }

  @Get('locations')
  @ApiDescription('Search Kitchen Locations')
  @ApiQuery({ name: 'search', type: String, required: true })
  @ApiOkResponse({ type: SearchKitchenLocationsResponse })
  async kitchenLocations(@Query('search') search: string) {
    return await this.kitchenService.searchKitchenLocations({ search });
  }

  @Get('locations/:locationId')
  @ApiDescription('Search Kitchen Locations')
  @ApiParam({ name: 'locationId', type: String, required: true })
  @ApiOkResponse({ type: GetKitchenLocationDetailsResponse })
  async getKitchenLocationDetails(@Param('locationId') locationId: string) {
    return await this.kitchenService.getKitchenLocationDetails({ locationId });
  }

  @Get('recommeded-listings')
  @ApiRoute.LIST({ name: 'Recommended Listing', description: 'Got Recommended Listings', roles: [Role.GUEST] })
  async getBoostedListingsByKitchen() {
    const boostedKitchens = await this.kitchenService.getBoostedListingByKitchenIds({});
    const boostedListings = await this.listingService.getBoostedListingByKitchenIds({ boostedKitchens });
    return { data: boostedListings, message: 'Boosted Successfully', errors: null };
  }

  @Post('by-cuisine')
  @ApiRoute.UPDATE({ name: 'Search Kitchen', description: 'Search Kitchen by Cusine', roles: [Role.GUEST] })
  @ApiOkResponse({ type: SearchByLocationResponse })
  async searchKitchenByCuisine(@Body() dto: SearchByCuisineRequest) {
    const menuIds = await this.menuService.searchCuisine({ dto: dto.cuisine });
    const kitchenIds = await this.listingService.searchByDate({ dto, menuIds });
    const filteredKitchens = await this.searchService.searchByGuest({ dto, kitchenIds });
    return filteredKitchens;
  }
}
