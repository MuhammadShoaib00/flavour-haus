import {
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
  Query,
  Req,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import { ApiDescription, ApiFormData } from '../shared/decorators/custom';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import {
  CreateIngredientRequest,
  CreateIngredientResponse,
  DeletingIngredientRequest,
  DeletingIngredientResponse,
  GetIngredientsForRecipesResponse,
  GetIngredientsResponse,
  GetSingleIngredientResponse,
  UpdatingIngredientRequest,
  UpdatingIngredientResponse,
} from '../dto/user/ingrdients.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { IngredientService } from '../modules/listings/services/ingredient.service';

@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientsController {
  protected readonly logger = new Logger(IngredientsController.name);
  constructor(private ingredientService: IngredientService) {}

  @Get()
  @ApiRoute.LIST({
    name: 'Get Ingredients',
    description: 'Get All Ingredients',
    roles: [Role.HOST],
  })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'filter', type: String, description: 'search in name and unit', required: false })
  @ApiCreatedResponse({ type: GetIngredientsResponse })
  async getIngredients(
    @Req() req,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('filter') search: string,
  ) {
    const ingrdients = await this.ingredientService.getIngredients({
      hostId: req.user.userId,
      limit,
      offset,
      search,
    });
    return { data: ingrdients, errors: null, message: 'All Ingrdients' };
  }

  @Get('all')
  @ApiRoute.LIST({
    name: 'Get Ingredients and Recipes',
    description: 'Get All Ingredients For Recipes',
    roles: [Role.HOST],
  })
  @ApiCreatedResponse({ type: GetIngredientsForRecipesResponse })
  async getIngredientsForRecipes(@Req() { user }) {
    const ingrdients = await this.ingredientService.getIngredientsForRecipes({ hostId: user.userId });
    return { data: ingrdients, errors: null, message: 'All Ingrdients' };
  }

  @Get('id')
  @ApiRoute.LIST({
    name: 'Get Ingredient',
    description: 'Got Ingredient',
    roles: [Role.HOST],
  })
  @ApiQuery({ name: 'ingredientId', type: String })
  @ApiCreatedResponse({ type: GetSingleIngredientResponse })
  async getSignleListing(@Param('ingredientId') ingredientId: string) {
    const ingredient = await this.ingredientService.getIngredient({ ingredientId });
    return { data: ingredient, errors: null, message: null };
  }

  @ApiFormData({
    single: true,
    fieldName: 'icon',
    fileTypes: ['png', 'jpeg', 'jpg'],
    errorMessage: 'Invalid image file entered.',
  })
  @Post()
  @ApiRoute.UPDATE({
    name: 'Created Ingredient',
    description: 'Created Ingredients',
    roles: [Role.HOST],
  })
  @ApiCreatedResponse({ type: CreateIngredientResponse })
  async create(
    @Req() req,
    @Body() dto: CreateIngredientRequest,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    const ingredient = await this.ingredientService.addIngredient({ dto, hostId: req.user.userId, icon });
    return { errors: null, message: 'Ingredient created successfully.', data: ingredient };
  }

  @ApiFormData({
    single: true,
    fieldName: 'icon',
    fileTypes: ['png', 'jpeg', 'jpg'],
    errorMessage: 'Invalid image file entered.',
  })
  @Patch(':ingredientId')
  @ApiRoute.UPDATE({
    name: 'Ingredient',
    description: 'Update Ingredient',
    roles: [Role.HOST],
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: UpdatingIngredientResponse })
  async update(
    @Req() req,
    @Param('ingredientId') ingredientId: string,
    @Body() dto: UpdatingIngredientRequest,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    const ingredient = await this.ingredientService.updateIngredient({
      dto: { ...dto, ingredientId },
      hostId: req.user.userId,
      icon,
    });
    return { data: ingredient, message: 'Ingredient updated successfully.', errors: null };
  }

  @Delete()
  @ApiRoute.DELETE({
    name: 'Delete Ingredient',
    description: 'Delete Ingredients',
    roles: [Role.HOST],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: DeletingIngredientResponse })
  async delete(@Req() req, @Body() dto: DeletingIngredientRequest) {
    await this.ingredientService.removeIngredient({
      ingredientIds: dto.ingredientIds.map(String),
      hostId: req.user.userId,
    });
    return { data: null, message: 'Ingredient(s) deleted successfully.', errors: null };
  }
}
