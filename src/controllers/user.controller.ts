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
import { Role } from '../shared/interfaces/role';
import { checkIfEmail } from '../shared/utils';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  DeleteUserResponseDto,
  GetUserResponseDto,
  ListUsersResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
  AssignRoleResponseDto,
  AssignRoleRequestDto,
  RemoveRoleResponseDto,
  RemoveRoleRequestDto,
  ChangeStatusResponseDto,
} from '../dto/user';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { PhoneNumberAlreadyExists } from '../shared/exceptions/phone-no-exists.exception';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { AdminUserService } from '../modules/user-account/services/admin-user.service';
import { UserService } from '../modules/user-profile/services/user.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  protected readonly logger = new Logger(UserController.name);

  constructor(
    private adminUserService: AdminUserService,
    private userService: UserService,
    private kitchenService: KitchenService,
  ) {}

  @Post()
  @ApiRoute.UPDATE({ name: 'User', description: 'Create User', roles: [Role.SYS_ADMIN] })
  @ApiCreatedResponse({ type: CreateUserResponseDto })
  async create(
    @Body() { email, phoneNumber, ...dto }: CreateUserRequestDto,
  ): Promise<{ data: Record<string, any>; message: string; errors: null }> {
    const { data: userAccountData } = await this.adminUserService.createUser({ email, phone_number: phoneNumber });
    await this.adminUserService.assignRoleToUser({ userId: userAccountData.userId, role: dto.defaultRole });
    const user = await this.userService.updateUser({
      userId: userAccountData.userId,
      email: Buffer.from(email).toString('base64'),
      phoneNumber,
      ...dto,
    } as any);

    if (dto.defaultRole == Role.HOST) {
      try {
        await this.kitchenService.createKitchenDetails({
          userId: userAccountData.userId,
          userName: dto.firstName + ' ' + dto.lastName,
          userRating: 0,
          name: '',
          servingDays: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false },
        });
      } catch (err) {
        this.logger.debug(err.message);
      }
    }

    return {
      data: { ...user, emailSent: userAccountData.emailSent },
      message: userAccountData.emailSent
        ? 'User created successfully. Temporary password email sent.'
        : 'User created successfully, but temporary password email could not be sent.',
      errors: null,
    };
  }

  @Get(':userId/resend-password')
  @ApiRoute.LIST({ name: 'User', description: 'Resend User Password', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', required: true })
  @ApiCreatedResponse({ type: CreateUserResponseDto })
  async resendPassword(@Param('userId') userId: string) {
    return await this.adminUserService.resendPassword({ userId });
  }

  @Get()
  @ApiRoute.LIST({ name: 'Users', description: 'Get All User', roles: [Role.SYS_ADMIN] })
  @ApiQuery({ name: 'by-role', enum: Role, required: false })
  @ApiQuery({ name: 'search', type: String, description: 'Firstname, lastname and email (if email, it must be a valid email)', required: false })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiOkResponse({ type: ListUsersResponseDto })
  async list(
    @Req() req: any,
    @Query('by-role') role: string,
    @Query('search') search: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    let userFromCognito: any = null;
    if (search && search != '' && checkIfEmail(search)) {
      userFromCognito = await this.adminUserService.searchUsers({ search } as any);
    }
    const users = await this.userService.listUsers({ role, search, limit, offset, userFromCognito });
    return { data: { ...users }, message: '', errors: null };
  }

  @Get(':userId')
  @ApiRoute.LIST({ name: 'User', description: 'Get Single User', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', required: true })
  @ApiOkResponse({ type: GetUserResponseDto })
  async get(@Param('userId') userId: string) {
    const { data: userAccountData } = await this.adminUserService.getUser({ userId });
    const { data: userProfileData } = await this.userService.getUser({ userId });
    return { data: { ...userAccountData, ...userProfileData }, message: '', errors: null };
  }

  @Patch(':userId')
  @ApiRoute.UPDATE({ name: 'User Update', description: 'Update User', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', required: true })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: UpdateUserResponseDto })
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<{ data: Record<string, any>; message: string; errors: null }> {
    let { email, phoneNumber: phone_number, ...data } = dto;
    const checkPhoneNumber = await this.userService.checkPhoneNumber({ phoneNumber: phone_number, userId });
    if (checkPhoneNumber === true) {
      throw new PhoneNumberAlreadyExists('Phone number already exists');
    }
    const { data: user } = await this.userService.getUser({ userId });
    const userAccountData = await this.adminUserService.updateUser({ userId, email, phone_number });
    await this.adminUserService.removeRoleOfUser({ userId, role: user.defaultRole });
    await this.adminUserService.assignRoleToUser({ userId, role: dto.defaultRole });
    email = Buffer.from(email).toString('base64');
    const userProfileData = await this.userService.updateUser({ userId, ...data, email });
    return { data: { ...userAccountData, ...userProfileData }, message: 'User updated successfully.', errors: null };
  }

  @Delete(':userId')
  @ApiRoute.DELETE({ name: 'User Delete', description: 'Delete User', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', required: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: DeleteUserResponseDto })
  async delete(@Param('userId') userId: string) {
    await this.adminUserService.deleteUser({ userId });
    await this.userService.deleteUser({ userId });
    return { data: null, message: 'User deleted successfully.', errors: null };
  }

  @Get(':userId/change-status')
  @ApiRoute.LIST({ name: 'Change Status', description: 'Change User Status', roles: [Role.SYS_ADMIN] })
  @ApiParam({ name: 'userId', required: true })
  @ApiQuery({ name: 'isActive', type: 'boolean', required: true })
  @ApiOkResponse({ type: ChangeStatusResponseDto })
  async changeStatus(@Param('userId') userId: string, @Query('isActive') isActive: string) {
    const checker = await this.adminUserService.changeStatus({ userId, isActive: isActive === 'true' });
    if (checker) {
      await this.userService.adminChangeStatus({ userId, isActive: isActive === 'true' });
    }
    return checker;
  }

  @Post('assign-role')
  @ApiRoute.UPDATE({ name: 'Assign Role', description: 'Assign Role to User', roles: [Role.SYS_ADMIN] })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AssignRoleResponseDto })
  async assignRole(@Body() dto: AssignRoleRequestDto) {
    return await this.adminUserService.assignRoleToUser(dto);
  }

  @Post('remove-role')
  @ApiRoute.UPDATE({ name: 'Remove Role', description: 'Remove Role From User', roles: [Role.SYS_ADMIN] })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RemoveRoleResponseDto })
  async removeRole(@Body() dto: RemoveRoleRequestDto) {
    return await this.adminUserService.removeRoleOfUser(dto);
  }
}
