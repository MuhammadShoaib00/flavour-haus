import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UploadedFiles,
  Param,
  Patch,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiFormData } from '../shared/decorators/custom';
import { Role } from '../shared/interfaces/role';
import { CreateMenuDTO } from '../dto/menu/create-menu.dto';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { AddFoodItemsRequestDto } from '../dto/menu/add-food-item.dto';
import { UpdateFoodItemsRequestDto } from '../dto/menu/update-food-item.dto';
import { ApiResponseDto } from '../dto/common/ApiResponse.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { DeletingRecipeImageRequest } from '../dto/user/recipes.dto';
import { MenuService } from '../modules/menu/services/menu.service';
import { RecipeService } from '../modules/listings/services/recipe.service';
import { ListingService } from '../modules/listings/services/listing.service';

@ApiTags('Menu')
@Controller('menus')
export class MenuController {
  protected readonly logger = new Logger(MenuController.name);

  constructor(
    private menuService: MenuService,
    private recipeService: RecipeService,
    private listingService: ListingService,
  ) {}

  @Get()
  @ApiRoute.LIST({
    name: 'Host Menu',
    description: 'Get Host Menus',
    roles: [Role.HOST],
  })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiOkResponse({ type: ApiResponseDto })
  async getHostMenus(
    @Req() req,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const menus = await this.menuService.getHostMenu({ userId: req.user.userId, limit, offset });
    return { data: menus, message: 'Menu created successfully', errors: null };
  }

  @Get(':menuId')
  @ApiRoute.LIST({
    name: 'Menu Details',
    description: 'Get Menu Details',
    roles: [Role.HOST],
  })
  @ApiParam({ name: 'menuId', required: true })
  @ApiOkResponse({})
  async getMenuDetail(@Req() req) {
    const menu = await this.menuService.getMenuDetail({ userId: req.user.userId, menuId: req.params.menuId });
    return { data: menu, message: 'Menu retrieved successfully', errors: null };
  }

  @Post()
  @ApiRoute.UPDATE({ name: 'Menu', description: 'Create Menu', roles: [Role.HOST] })
  @ApiFormData({ multiple: true, fileTypes: ['png', 'jpeg'], errorMessage: 'Invalid image files entered.' })
  @ApiCreatedResponse({})
  async createMenu(
    @Req() req,
    @Body() dto: CreateMenuDTO,
    @UploadedFiles() { menuImages }: { [k: string]: Express.Multer.File[] },
  ) {
    try {
      const valueFrom = await this.menuService.addMenu({ menuDetails: dto, hostId: req.user.userId, menuImages });
      return { data: valueFrom.data, message: valueFrom.message, errors: null };
    } catch (e) {
      throw e;
    }
  }

  @Patch(':menuId')
  @ApiRoute.UPDATE({ name: 'Menu', description: 'Update Menu', roles: [Role.HOST] })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiFormData({ multiple: true, fileTypes: ['png', 'jpeg'], errorMessage: 'Invalid image files entered.' })
  @ApiParam({ name: 'menuId', required: true })
  @ApiAcceptedResponse({})
  async update(
    @Req() req,
    @Body() menuDetails: CreateMenuDTO,
    @UploadedFiles() { menuImages }: { [k: string]: Express.Multer.File[] },
  ) {
    try {
      const updateRes = await this.menuService.updateMenu({ menuDetails, menuId: req.params.menuId, hostId: req.user.userId, menuImages });
      return { errors: null, message: 'Menu updated successfully.', data: updateRes.data };
    } catch (e) {
      throw e;
    }
  }

  @Delete(':menuId')
  @ApiRoute.DELETE({ name: 'Menu', description: 'Delete Menu', roles: [Role.HOST] })
  @ApiParam({ name: 'menuId', required: true })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({})
  async delete(@Req() req) {
    try {
      await this.menuService.removeMenu({ menuId: req.params.menuId, hostId: req.user.userId });
      await this.listingService.unListListings({ menuId: req.params.menuId, hostId: req.user.userId });
      return { data: null, message: 'Menu deleted successfully.', errors: null };
    } catch (e) {
      throw e;
    }
  }

  @Delete(':menuId/remove-image')
  @ApiRoute.DELETE({ name: 'Menu', description: 'Delete Menu', roles: [Role.HOST] })
  @ApiParam({ name: 'menuId', required: true })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({})
  async deleteMenuImage(@Req() req, @Body() dto: DeletingRecipeImageRequest) {
    try {
      await this.menuService.removeMenuimage({ menuId: req.params.menuId, hostId: req.user.userId, imageUrl: dto.imageUrl });
      return { data: null, message: 'Image deleted successfully.', errors: null };
    } catch (e) {
      throw e;
    }
  }

  @Get('menu-items/trending')
  @ApiRoute.LIST({ name: 'Top Menu Items', description: 'Viewed Top Menu Items', roles: [Role.HOST] })
  async getTopMenuItems(@Request() req: any) {
    return await this.menuService.getTopFoodItems({ userId: req.user.userId });
  }

  @Post('add-food-item/:menuId')
  @ApiRoute.UPDATE({ name: 'Food Items', description: 'Create Food Items', roles: [Role.HOST] })
  @ApiParam({ name: 'menuId', required: true })
  @ApiFormData({ multiple: true, fileTypes: ['png', 'jpeg'], errorMessage: 'Invalid image files entered.' })
  @ApiCreatedResponse({})
  async addFoodItem(
    @Body() dto: AddFoodItemsRequestDto,
    @UploadedFiles() { foodImages }: { [k: string]: Express.Multer.File[] },
    @Param('menuId') menuId: string,
    @Request() req: any,
  ) {
    return await this.menuService.addFoodItemInMenu({ foodImages, foodDetails: dto, menuId, hostId: req.user.userId });
  }

  @Patch('/food-item/:foodId')
  @ApiRoute.UPDATE({ name: 'Food Item', description: 'Update Food item', roles: [Role.HOST] })
  @ApiParam({ name: 'foodId', required: true })
  @ApiFormData({ multiple: true, fileTypes: ['png', 'jpeg'], errorMessage: 'Invalid image files entered.' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({})
  async updateFoodItems(
    @Param('foodId') foodId: string,
    @Body() dto: UpdateFoodItemsRequestDto,
    @UploadedFiles() { foodImages }: { [k: string]: Express.Multer.File[] },
    @Request() req: any,
  ) {
    return await this.menuService.updateFoodItem({ foodId, foodDetails: dto, foodImages, hostId: req.user.userId });
  }

  @Delete('food-item/:foodId')
  @ApiRoute.DELETE({ name: 'Food_Item', description: 'Deleted Food Item', roles: [Role.HOST] })
  @ApiParam({ name: 'foodId', required: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({})
  async deleteFoodItem(@Param('foodId') foodId: string, @Request() req: any) {
    return await this.menuService.deleteFoodItem({ foodId, hostId: req.user.userId });
  }

  @Get('food-item/get-nutritional-info')
  @ApiRoute.LIST({ name: 'Nutritional_Info', description: 'Get Nutritional Info', roles: [Role.HOST] })
  @ApiQuery({ name: 'query', example: 'chicken, tomato, onion', required: true })
  async getNutritionalInfo(@Query('query') query: string) {
    return {
      data: await this.recipeService.getNutritionalInfo({ query }),
      errors: null,
      message: null,
    };
  }

  @Get('food-item/:foodId')
  @ApiRoute.LIST({ name: 'Food_Item', description: 'Get Food Item', roles: [Role.HOST, Role.GUEST, Role.SYS_ADMIN] })
  @ApiParam({ name: 'foodId', required: true })
  async getFoodItem(@Param('foodId') foodId: string, @Request() req: any) {
    return await this.menuService.getFoodItem({ foodId, hostId: req.user.userId });
  }

  @Delete('food-item/:foodId/remove-image')
  @ApiRoute.DELETE({ name: 'Menu', description: 'Delete Menu', roles: [Role.HOST] })
  @ApiParam({ name: 'foodId', required: true })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({})
  async deleteFoodItemsImage(@Req() req, @Body() dto: DeletingRecipeImageRequest) {
    try {
      await this.menuService.removefoodimage({ foodId: req.params.foodId, imageUrl: dto.imageUrl, hostId: req.user.userId });
      return { data: null, message: 'Image deleted successfully.', errors: null };
    } catch (e) {
      throw e;
    }
  }
}
