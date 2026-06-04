import {
  Body,
  Controller,
  Get,
  Post,
  Logger,
  Req,
  HttpCode,
  HttpStatus,
  UploadedFile,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiFormData } from '../shared/decorators/custom';
import { CreateWishlistRequestDto } from '../dto/wishlist/wishlist-dto';
import { EditWishlistRequestDto } from '../dto/wishlist/Editwishlist-dto';
import { Role } from '../shared/interfaces/role';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { WishlistService } from '../modules/wishlist/services/wishlist.service';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  private readonly logger = new Logger(WishlistController.name);
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiRoute.LIST({
    name: 'Wishlist',
    description: 'Get User Wishlists',
    roles: [Role.GUEST],
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: CreateWishlistRequestDto,
  })
  async getUserWishlist(@Req() { user: { userId } }) {
    try {
      const userWishList = await this.wishlistService.getUserWishlist({ userId });
      return {
        error: null,
        userWishList,
        message: 'Successfully retrived user wishlist',
      };
    } catch (e) {
      throw e;
    }
  }

  @Get(':wishlistId')
  @ApiRoute.LIST({
    name: 'wishlist',
    description: 'Get User Wishlist Details',
    roles: [Role.GUEST],
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: CreateWishlistRequestDto,
  })
  @ApiParam({
    name: 'wishlistId',
    required: true,
  })
  async getWishListDetails(
    @Req() { user: { userId } },
    @Param('wishlistId') id: string,
  ) {
    return await this.wishlistService.getWishlistDetail({ userId, id });
  }

  @Post()
  @ApiRoute.UPDATE({
    name: 'Create Wishlist',
    description: 'Create User Wishlist',
    roles: [Role.GUEST],
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiFormData({
    single: true,
    fileTypes: ['png', 'jpeg', 'svg', 'jpg'],
    fieldName: 'imageFile',
    errorMessage: 'Invalid image file entered.',
    required: false,
  })
  @ApiCreatedResponse({
    type: CreateWishlistRequestDto,
  })
  async addWishlist(
    @Req() { user: { userId } },
    @Body() dto: CreateWishlistRequestDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return await this.wishlistService.addWishlist({ ...dto, userId, imageFile });
  }

  @Delete(':wishlistId')
  @ApiRoute.DELETE({
    name: 'Delete Wishlist',
    description: 'Delete User Wishlist',
    roles: [Role.GUEST],
  })
  @HttpCode(200)
  async deleteWishlist(@Param('wishlistId') id: string) {
    return await this.wishlistService.deleteWishlist({ id });
  }

  @Put(':wishlistId')
  @ApiRoute.UPDATE({
    name: 'Edit Wishlist',
    description: 'Edit User Wishlist',
    roles: [Role.GUEST],
  })
  @HttpCode(200)
  @ApiFormData({
    single: true,
    fileTypes: ['png', 'jpeg', 'svg', 'jpg'],
    fieldName: 'imageFile',
    errorMessage: 'Invalid image files entered.',
  })
  async editWishlist(
    @Body() dto: EditWishlistRequestDto,
    @Param('wishlistId') id: string,
    @UploadedFile() imageFile: Express.Multer.File,
    @Req() { user: { userId } },
  ) {
    return await this.wishlistService.updateWishlist({ ...dto, id, imageFile, userId });
  }

  @Put(':wishlistId/host/:hostid')
  @ApiRoute.UPDATE({
    name: 'Wishlist',
    description: 'PUT host wishlist',
    roles: [Role.GUEST],
  })
  @ApiParam({ name: 'wishlistId', required: true })
  @HttpCode(200)
  async puthostwishlist(
    @Param('wishlistId') id: string,
    @Param('hostid') hostId: string,
    @Req() { user: { userId } },
  ) {
    return await this.wishlistService.puthostwishlist({ id, userId, hostId });
  }

  @Put(':wishlistId/listing/:listingid')
  @ApiRoute.UPDATE({
    name: 'Listing Wishlist',
    description: 'Put Listing Wishlist',
    roles: [Role.GUEST],
  })
  @ApiParam({ name: 'wishlistId', required: true })
  @ApiParam({ name: 'listingId', required: true })
  @HttpCode(200)
  async putlistingwishlist(
    @Param('wishlistId') id: string,
    @Param('listingid') listingId: string,
    @Req() { user: { userId } },
  ) {
    return await this.wishlistService.putlistingwishlist({ id, userId, listingId });
  }

  @Put(':wishlistId/removehost/:hostid')
  @ApiRoute.UPDATE({
    name: 'Host_Wishlist',
    description: 'Remove Host Wishlist',
    roles: [Role.GUEST],
  })
  @ApiParam({ name: 'wishlistId', required: true })
  @ApiParam({ name: 'hostid', required: true })
  @HttpCode(200)
  async removehostwishlist(
    @Param('wishlistId') id: string,
    @Param('hostid') hostId: string,
    @Req() { user: { userId } },
  ) {
    return await this.wishlistService.removehostwishlist({ id, userId, hostId });
  }

  @Put(':wishlistId/removelisting/:listingid')
  @ApiRoute.UPDATE({
    name: 'Listing_Wishlist',
    description: 'Remove Listing Wishlist',
    roles: [Role.GUEST],
  })
  @ApiParam({ name: 'wishlistId', required: true })
  @ApiParam({ name: 'listingid', required: true })
  @HttpCode(200)
  async removelistingwishlist(
    @Param('wishlistId') id: string,
    @Param('listingid') listingId: string,
    @Req() { user: { userId } },
  ) {
    return await this.wishlistService.removelistingwishlist({ id, userId, listingId });
  }
}
