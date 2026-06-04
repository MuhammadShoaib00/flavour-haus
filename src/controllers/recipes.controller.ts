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
  UploadedFiles,
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
import { ApiFormData } from '../shared/decorators/custom';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  DeletingRecipeImageRequest,
  DeletingRecipeImageResponse,
  DeletingRecipeRequest,
  DeletingRecipeResponse,
  GetRecipiesResponse,
  GetSingleRecipeResponse,
  UpdatingRecipeRequest,
  UpdatingRecipeResponse,
} from '../dto/user/recipes.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { RecipeService } from '../modules/listings/services/recipe.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  protected readonly logger = new Logger(RecipesController.name);
  constructor(private recipeService: RecipeService) {}

  @Get()
  @ApiRoute.LIST({
    name: 'ALL Recipes',
    description: 'Get All Recipies',
    roles: [Role.HOST],
  })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'filter', type: String, description: 'search in name, description, category, main_ingredient, cuisine, ingredients', required: false })
  @ApiCreatedResponse({ type: GetRecipiesResponse })
  async list(
    @Req() req,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('filter') search: string,
  ) {
    const recipes = await this.recipeService.getRecipes({ hostId: req.user.userId, limit, offset, search });
    return { data: recipes, errors: null, message: 'All Recipes' };
  }

  @Get(':recipeId')
  @ApiRoute.LIST({
    name: 'Recipe',
    description: 'Get Single Recipe',
    roles: [Role.HOST],
  })
  @ApiParam({ name: 'recipeId', type: String })
  @ApiCreatedResponse({ type: GetSingleRecipeResponse })
  async get(@Param('recipeId') recipeId: string) {
    const recipe = await this.recipeService.singleRecipe({ recipeId });
    return { data: recipe, errors: null, message: null };
  }

  @ApiFormData({
    multiple: true,
    fileTypes: ['png', 'jpeg', 'jpg'],
    errorMessage: 'Invalid image files entered.',
  })
  @Post()
  @ApiRoute.UPDATE({
    name: 'Create Recipe',
    description: 'Create Recipe',
    roles: [Role.HOST],
  })
  @ApiCreatedResponse({ type: CreateRecipeResponse })
  async create(
    @Req() req,
    @Body() dto: CreateRecipeRequest,
    @UploadedFiles() { recipeImages }: { [k: string]: Express.Multer.File[] },
  ) {
    const listing = await this.recipeService.addRecipe({ dto, hostId: req.user.userId, recipeImages });
    return { errors: null, message: 'Recipe created successfully.', data: listing };
  }

  @ApiFormData({
    multiple: true,
    fileTypes: ['png', 'jpeg', 'jpg'],
    errorMessage: 'Invalid image files entered.',
  })
  @Patch(':recipeId')
  @ApiRoute.UPDATE({
    name: 'Recipe',
    description: 'Update Recipe',
    roles: [Role.HOST],
  })
  @ApiParam({ name: 'recipeId', type: String })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: UpdatingRecipeResponse })
  async update(
    @Req() req,
    @Param('recipeId') recipeId: string,
    @Body() dto: UpdatingRecipeRequest,
    @UploadedFiles() { recipeImages }: { [k: string]: Express.Multer.File[] },
  ) {
    const data = await this.recipeService.updateRecipe({
      dto: { ...dto, recipeId },
      hostId: req.user.userId,
      recipeImages,
    });
    return { data, message: 'Recipe updated successfully.', errors: null };
  }

  @Delete()
  @ApiRoute.DELETE({
    name: 'Recipe',
    description: 'Delete Recipe',
    roles: [Role.HOST],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: DeletingRecipeResponse })
  async delete(@Req() req, @Body() dto: DeletingRecipeRequest) {
    await this.recipeService.removeRecipe({ recipeIds: dto.recipeIds.map(String), hostId: req.user.userId });
    return { data: null, message: 'Recipe(s) deleted successfully.', errors: null };
  }

  @Delete(':recipeId/remove-image')
  @ApiRoute.DELETE({
    name: 'Remove Recipe Image',
    description: 'Remove Recipe Image',
    roles: [Role.HOST],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: DeletingRecipeImageResponse })
  async removeImage(
    @Req() req,
    @Param('recipeId') recipeId: string,
    @Body() dto: DeletingRecipeImageRequest,
  ) {
    await this.recipeService.removeRecipeImage({ recipeId, imageUrl: dto.imageUrl, hostId: req.user.userId });
    return { data: null, message: 'Recipe Image deleted successfully.', errors: null };
  }
}
