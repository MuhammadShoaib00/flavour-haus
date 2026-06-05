import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
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
  AddBadgesDTO,
  GetKitchenDetailsResponseDto,
  RemoveCoverPhotoRequestDto,
  RemoveCoverPhotoResponseDto,
  SelectCoverPhotoRequestDto,
  SelectCoverPhotoResponseDto,
  UpdateKitchenDetailsRequestDto,
  UpdateKitchenDetailsResponseDto,
} from '../dto/kitchen';
import { Role } from '../shared/interfaces/role';
import { ApiDescription, ApiFormData, Roles } from '../shared/decorators/custom';
import {
  AddFacilityRequestDto,
  AddFacilityResponceDto,
  GetContractBookPDFLinkDto,
  getDBSInfoResponseDto,
  getLicenseDetailResponseDto,
  MyFacilityRequestDto,
  MyFacilityResponceDto,
  PostDetailResponseDto,
  PostUserData,
  ProfileImageDto,
  SignContractResponseDto,
  UpdateDBSInfoRequestDto,
  UpdateDBSInfoResponseDto,
} from '../dto/user';
import { AuthN } from '../shared/decorators/authN.decorator';
import { PostLicenseData } from '../dto/user/post-license';
import {
  CreateFoodIngredientRequestDto,
  CreateFoodIngredientResponseDto,
  ListFoodIngredientsResponseDto,
  RestrictIngredientsRequestDto,
  RestrictIngredientsResponseDto,
  UpdateHouseRulesRequestDto,
} from '../dto/house-rules';
import { CheckHostNotConfirmed } from '../shared/decorators/checkHostNotConfirmed';
import { ProfileCompletionTypes } from '../shared/interfaces/user';
import { ProfileCompletionDto } from '../dto/user/profile-completion.dto';
import { PhoneNumberAlreadyExists } from '../shared/exceptions/phone-no-exists.exception';
import { BoostListingDTO, BoostListingSuccess } from '../dto/user/boostlisting.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { UserService } from '../modules/user-profile/services/user.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';
import { HouseRulesService } from '../modules/user-profile/services/house-rules.service';
import { AdminUserService } from '../modules/user-account/services/admin-user.service';

@ApiTags('User Profile')
@Controller('user-profile')
export class UserProfileController {
  protected readonly logger = new Logger(UserProfileController.name);

  constructor(
    private userService: UserService,
    private kitchenService: KitchenService,
    private houseRulesService: HouseRulesService,
    private adminUserService: AdminUserService,
  ) {}

  @AuthN()
  @ApiDescription('Update Personal Details')
  @Post('personal-details')
  @ApiCreatedResponse({ type: PostDetailResponseDto })
  async postProfileData(@Request() req, @Body() dto: PostUserData) {
    delete dto['profileImage'];
    const checkPhoneNumber = await this.userService.checkPhoneNumber({
      phoneNumber: dto.phoneNumber,
      userId: req.user.userId,
    });
    if (checkPhoneNumber === true) {
      throw new PhoneNumberAlreadyExists('Phone number already exists');
    }
    return await this.userService.postPersonalInfo({
      dto: { ...dto, userId: req.user.userId, userIsHost: (req.user.defaultRole || req.user.role) == Role.HOST },
      user: req.user,
    });
  }

  @AuthN()
  @Put('update-profile-image')
  @ApiFormData({ single: true, fieldName: 'profileImage', fileTypes: ['png', 'jpeg', 'jpg'], errorMessage: 'Invalid image file entered.' })
  @ApiCreatedResponse({ type: PostDetailResponseDto })
  @ApiDescription('Update Profile Image')
  async updateProfileImage(
    @Request() req,
    @Body() dto: ProfileImageDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const data = await this.userService.updateProfileImage({ userId: req.user.userId, image: profileImage });
    return { data, message: 'Profile Image Updated Successfully', errors: null };
  }

  @CheckHostNotConfirmed()
  @Get('kitchen-details')
  @ApiRoute.LIST({ name: 'Kitchen Details', description: 'Get Kitchen Details', roles: [Role.HOST, Role.SYS_ADMIN] })
  @ApiOkResponse({ type: GetKitchenDetailsResponseDto })
  async getKitchenDetails(@Request() { user: { userId } }) {
    return await this.kitchenService.getKitchenDetails({ userId });
  }

  @CheckHostNotConfirmed()
  @Patch('kitchen-details')
  @ApiRoute.UPDATE({ name: 'Kitchen Details', description: 'Update Kitchen Details', roles: [Role.HOST] })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiFormData({ multiple: true, fileTypes: ['png', 'jpeg'], errorMessage: 'Invalid image files entered.' })
  @ApiAcceptedResponse({ type: UpdateKitchenDetailsResponseDto })
  async updateKitchenDetails(
    @Request() { user: { userId } },
    @Body() dto: UpdateKitchenDetailsRequestDto,
    @UploadedFiles() { coverPhotos }: { [k: string]: Express.Multer.File[] },
  ) {
    const data = await this.kitchenService.updateKitchenDetails({ userId, coverPhotos, ...dto });
    await this.userService.updateProfileCompletion({
      hostId: userId,
      key: ProfileCompletionTypes.KITCHEN_DETAILS,
    });
    return data;
  }

  @CheckHostNotConfirmed()
  @Patch('kitchen-details/cover-photo')
  @ApiRoute.UPDATE({ name: 'Update Cover Photo', description: 'Update Cover Photo', roles: [Role.HOST, Role.SYS_ADMIN] })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: SelectCoverPhotoResponseDto })
  async selectCoverPhoto(
    @Request() { user: { userId } },
    @Body() dto: SelectCoverPhotoRequestDto,
  ) {
    return await this.kitchenService.selectCoverPhoto({ userId, ...dto });
  }

  @CheckHostNotConfirmed()
  @Delete('kitchen-details/cover-photo')
  @ApiRoute.DELETE({ name: 'Remove Cover Photo', description: 'Delete Cover Photo', roles: [Role.HOST, Role.SYS_ADMIN] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: RemoveCoverPhotoResponseDto })
  async removeCoverPhoto(
    @Request() { user: { userId } },
    @Body() dto: RemoveCoverPhotoRequestDto,
  ) {
    return await this.kitchenService.removeCoverPhoto({ userId, ...dto });
  }

  @CheckHostNotConfirmed()
  @Patch('house-rules')
  @ApiRoute.UPDATE({ name: 'House Rule', description: 'Update House Rules', roles: [Role.HOST, Role.SYS_ADMIN] })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: CreateFoodIngredientResponseDto })
  async updateHouseRules(@Request() { user: { userId } }, @Body() dto: UpdateHouseRulesRequestDto) {
    return await this.houseRulesService.updateHouseRules({ userId, houseRules: { ...dto } });
  }

  @CheckHostNotConfirmed()
  @Get('house-rules/food-ingredients')
  @ApiRoute.LIST({ name: 'Food Ingredients', description: 'Get All Food Ingredients', roles: [Role.HOST, Role.SYS_ADMIN] })
  @ApiQuery({ name: 'restricted', required: false, type: Boolean })
  @ApiCreatedResponse({ type: ListFoodIngredientsResponseDto })
  async listFoodIngredients(@Request() { user: { userId } }, @Query('restricted') restricted?: string) {
    return await this.houseRulesService.listFoodIngredients({ userId, restricted: restricted == 'true' });
  }

  @CheckHostNotConfirmed()
  @Post('house-rules/food-ingredients')
  @ApiRoute.UPDATE({ name: 'Food Ingredients', description: 'Created Food Ingredient', roles: [Role.HOST] })
  @ApiFormData({ single: true, fieldName: 'imageFile', fileTypes: ['png', 'jpg', 'svg', 'bmp', 'jpeg'], errorMessage: 'Invalid image file entered.' })
  @ApiCreatedResponse({ type: CreateFoodIngredientResponseDto })
  async createFoodIngredient(
    @Request() { user: { userId } },
    @Body() dto: CreateFoodIngredientRequestDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return await this.houseRulesService.createFoodIngredient({ userId, imageFile, ...dto });
  }

  @CheckHostNotConfirmed()
  @Patch('house-rules/food-ingredients/restrict')
  @ApiRoute.UPDATE({ name: 'Restricted Food', description: 'Restricted Food Ingredients', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: RestrictIngredientsResponseDto })
  async updateRestrictedFood(@Request() { user: { userId } }, @Body() dto: RestrictIngredientsRequestDto) {
    return await this.houseRulesService.updateRestrictedFood({ userId, ...dto });
  }

  @CheckHostNotConfirmed()
  @Post('add-new-facility')
  @ApiRoute.UPDATE({ name: 'Facility', description: 'Created Facility', roles: [Role.HOST] })
  @ApiFormData({ fieldName: 'icon', single: true, fileTypes: ['png', 'jpg', 'jpeg'] })
  @ApiCreatedResponse({ type: AddFacilityResponceDto })
  async addFacilities(@Request() req: any, @Body() dto: AddFacilityRequestDto, @UploadedFile() icon: Express.Multer.File) {
    return await this.userService.addNewFacility({ dto, user: req.user.userId, icon });
  }

  @CheckHostNotConfirmed()
  @Get('list-facility')
  @ApiRoute.LIST({ name: 'List Facility', description: 'Get All Facilities', roles: [Role.HOST, Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: AddFacilityResponceDto })
  async listFacilities(@Request() req: any) {
    return await this.userService.listFacility({ userId: req.user.userId });
  }

  @CheckHostNotConfirmed()
  @Post('save-my-facility')
  @ApiRoute.UPDATE({ name: 'Save My Facility', description: 'Update Facility', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: MyFacilityResponceDto })
  async myFacilities(@Request() req: any, @Body() dto: MyFacilityRequestDto) {
    return await this.kitchenService.myFacility({ dto, user: req.user.userId });
  }

  @CheckHostNotConfirmed()
  @Post('kitchen-details/add-badges')
  @ApiRoute.UPDATE({ name: 'Badges', description: 'Create Badges', roles: [Role.HOST] })
  @ApiCreatedResponse({})
  async addBadges(@Request() req: any, @Body() dto: AddBadgesDTO) {
    return await this.kitchenService.addBadges({ dto, hostId: req.user.userId });
  }

  @CheckHostNotConfirmed()
  @Post('licenses')
  @ApiRoute.UPDATE({ name: 'License', description: 'Update License Details', roles: [Role.HOST] })
  @ApiFormData({ single: true, fieldName: 'premisesPermissionFile', fileTypes: ['png', 'jpg', 'pdf', 'jpeg'], errorMessage: 'Invalid image file entered.' })
  @ApiCreatedResponse({ type: PostDetailResponseDto })
  async postLicense(
    @Request() req: any,
    @Body() dto: PostLicenseData,
    @UploadedFile() premisesPermissionFile: Express.Multer.File,
  ) {
    const data = await this.userService.postLicenseInfo({ dto, userId: req.user.userId, permissionFile: premisesPermissionFile });
    return { data, message: 'Host license info saved successfully', errors: null };
  }

  @CheckHostNotConfirmed()
  @Get('licenses')
  @ApiRoute.LIST({ name: 'Get License', description: 'Get License Details', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: getLicenseDetailResponseDto })
  async getLicenseInfo(@Request() { user: { userId } }) {
    const data = await this.userService.getLicenseInfo(userId);
    return { data, message: 'Host license info', errors: null };
  }

  @CheckHostNotConfirmed()
  @Patch('dbs-info')
  @ApiRoute.UPDATE({ name: 'DBS INFO', description: 'Update DBS info', roles: [Role.HOST] })
  @ApiFormData({ single: true, fieldName: 'dbsFile', fileTypes: ['png', 'jpg', 'pdf', 'jpeg'], errorMessage: 'Invalid image file entered.' })
  @ApiCreatedResponse({ type: UpdateDBSInfoResponseDto })
  async updateDBSInfo(
    @Request() { user: { userId } },
    @Body() dto: UpdateDBSInfoRequestDto,
    @UploadedFile() dbsFile: Express.Multer.File,
  ) {
    const data = await this.userService.updateDBSInfo(userId, dbsFile, dto.dbsStatus);
    return { data, message: 'DBS info updated successfully', errors: null };
  }

  @CheckHostNotConfirmed()
  @Get('dbs-info')
  @ApiRoute.LIST({ name: 'DBS INFO', description: 'Get DBS info', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: getDBSInfoResponseDto })
  async getDBSInfo(@Request() { user: { userId } }) {
    const data = await this.userService.getDBSInfo(userId);
    return { data, message: 'DBS info', errors: null };
  }

  @CheckHostNotConfirmed()
  @Get('sign-contract')
  @ApiRoute.LIST({ name: 'SIGN CONTRACT', description: 'Contract Sent For Signing', roles: [Role.HOST, Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: SignContractResponseDto })
  async signContract(@Request() { user }) {
    const { userId } = user;
    try {
      const { data: cognitoUser } = await this.adminUserService.getUser({ userId });
      const data = await this.userService.signContract({ hostId: userId, email: cognitoUser.email });
      return {
        data,
        message: 'Contract has been sent to your email. Please sign the contract, it will be updated automatically, you can leave this page safely.',
        errors: null,
      };
    } catch (e) {
      return { data: e, message: null, errors: [e.message] };
    }
  }

  @AuthN()
  @Get('my-profile')
  async getMyProfile(@Request() { user: { userId } }) {
    const { data: userAccountData } = await this.adminUserService.getUser({ userId });
    const { data: userProfileData } = await this.userService.getUser({ userId });
    return { data: { ...userAccountData, ...userProfileData }, message: null, errors: null };
  }

  @CheckHostNotConfirmed()
  @Get('contract-book/pdf-link')
  @ApiRoute.LIST({ name: 'Contract Link', description: 'Get Contract PDF Link', roles: [Role.HOST, Role.SYS_ADMIN] })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiCreatedResponse({ type: GetContractBookPDFLinkDto })
  async getContractBookPdfFile(@Request() { user }, @Query('userId') reqUserId: string) {
    const { defaultRole, userId } = user;
    if (defaultRole == Role.HOST && userId != reqUserId) {
      throw new ForbiddenException('You are not allowed to view this link');
    }
    const url = await this.userService.getContractBookPdfLink({ userId });
    if (url == null) {
      throw new NotFoundException('Link not found');
    }
    return { data: { url }, message: 'This url will expires soon', errors: null };
  }

  @CheckHostNotConfirmed()
  @Patch('update-profile-completion')
  @ApiRoute.UPDATE({ name: 'Profile Completion', description: 'Update Profile Completion', roles: [Role.HOST] })
  @ApiQuery({ name: 'key', enum: ProfileCompletionTypes, required: false })
  @ApiCreatedResponse({ type: ProfileCompletionDto })
  async updateProfileCompletion(@Request() { user: { userId } }, @Query('key') key: string) {
    const keyExists = Object.values(ProfileCompletionTypes).filter((value) => value === key);
    if (key == null || key == '' || keyExists.length == 0) {
      throw new BadRequestException("Key doesn't exists");
    }
    const data = await this.userService.updateProfileCompletion({ hostId: userId, key });
    return { data, message: 'Profile Completion Updated Successfully', errors: null };
  }

  @Patch('boost-listing/:kitchenId')
  @ApiRoute.UPDATE({ name: 'Boost Listing', description: 'Boost all listing of a host', roles: [Role.HOST] })
  @ApiCreatedResponse({ type: BoostListingSuccess })
  @ApiParam({ name: 'kitchenId', type: String, required: true })
  async boostListingByKitchen(
    @Request() { user: { userId } },
    @Body() boostedDates: BoostListingDTO,
    @Param('kitchenId') kitchenId: string,
  ) {
    await this.kitchenService.boostListingByUpdatingKitchen({ boostedDates, userId, kitchenId });
    return { data: null, message: 'All listed successfully boosted', errors: null };
  }

  @Get('top-rated')
  @ApiRoute.LIST({ name: 'Top_Rated', description: 'Get Top Rated Listings', roles: [Role.GUEST] })
  @ApiCreatedResponse({ type: BoostListingSuccess })
  async topRatedKitchen(@Request() { user: { userId } }) {
    const topRatedKitchen = await this.kitchenService.getTopRatedKitchensAndGetMenus({});
    return { data: topRatedKitchen.kitchens, message: 'top rated kitchen returned successfully', errors: null };
  }

  @Roles(Role.GUEST)
  @Get('kitchen-details/:kitchenId/guest')
  @ApiRoute.LIST({ name: 'kitchen', description: 'get limited kitchen details for guest', roles: [Role.GUEST] })
  @ApiCreatedResponse()
  @ApiParam({ name: 'kitchenId', type: String })
  async getKitchenForGuest(
    @Request() { user: { userId } },
    @Param('kitchenId') kitchenId: string,
  ) {
    const limitedKitchenDetails = await this.kitchenService.getKitchenDetailsForGuest({ kitchenId });
    const limitedHostDetails = await this.userService.getLimitedInfoAboutHot({ userId: limitedKitchenDetails.data.userId });
    delete limitedKitchenDetails.data.userId;
    return {
      data: { limitedKitchenDetails, limitedHostDetails },
      message: 'kitchen for guest retrieved successfully',
      errors: null,
    };
  }
}
