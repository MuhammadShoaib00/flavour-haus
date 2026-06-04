import {
  Body,
  Controller,
  Post,
  Logger,
  Req,
  Put,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiDescription } from '../shared/decorators/custom';
import {
  SigninRequestDto,
  SignupRequestDto,
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  ConfirmForgotPasswordResponseDto,
  ConfirmForgotPasswordRequestDto,
  SignOutResponseDto,
  SigninResponseDto,
  SignupResponseDto,
} from '../dto/auth';
import { Request } from 'express';
import { AuthN } from '../shared/decorators/authN.decorator';
import { PhoneNumberAlreadyExists } from '../shared/exceptions/phone-no-exists.exception';
import { RefreshTokenDto, RefreshTokenResponse } from '../dto/auth/refresh-token.dto';
import { Role } from '../shared/interfaces/role';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../modules/user-profile/services/user.service';
import { KitchenService } from '../modules/user-profile/services/kitchen.service';
import { AuthService } from '../modules/user-account/services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private userService: UserService,
    private kitchenService: KitchenService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiDescription('Account Sign up')
  @ApiCreatedResponse({ type: SignupResponseDto })
  async signup(@Body() dto: SignupRequestDto) {
    const userId = uuidv4();
    try {
      const { email, password, phoneNumber, ...user } = dto;
      if (![Role.HOST, Role.GUEST].includes(user.defaultRole)) {
        throw new BadRequestException('Kindly signup as Host or Guest.');
      }
      const checkPhoneNumber = await this.userService.checkPhoneNumber({ phoneNumber });
      if (checkPhoneNumber === true) {
        throw new PhoneNumberAlreadyExists('Phone number already exists');
      }
      const signupResponse = await this.userService.createUser({
        userId,
        email: Buffer.from(email).toString('base64'),
        ...user,
        password,
        phoneNumber,
      });
      if (user.defaultRole == Role.HOST) {
        try {
          await this.createKitchen(userId, dto.firstName, dto.lastName);
        } catch (err) {
          this.logger.debug(err.message);
        }
      }
      return signupResponse;
    } catch (err) {
      throw err;
    }
  }

  private async createKitchen(userId: string, firstName: string, lastName: string) {
    await this.kitchenService.createKitchenDetails({
      userId,
      userName: firstName + ' ' + lastName,
      name: '',
      servingDays: {
        Monday: false, Tuesday: false, Wednesday: false,
        Thursday: false, Friday: false, Saturday: false, Sunday: false,
      },
    } as any);
  }

  @Put('signin')
  @ApiDescription('Account Login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SigninResponseDto })
  async signin(@Body() dto: SigninRequestDto) {
    try {
      const { user, authToken, refreshToken, expiresIn } = await this.userService.signin(dto);
      const { data: userProfile } = await this.userService.getUser({ userId: user.userId });
      if (userProfile.email !== Buffer.from(user.email).toString('base64')) {
        await this.userService.updateUser({ userId: user.userId, email: Buffer.from(user.email).toString('base64') } as any);
      }
      if ((user as any).defaultRole == Role.HOST) {
        try {
          this.createKitchen(userProfile.userId, userProfile.firstName, userProfile.lastName);
        } catch (err) {
          this.logger.debug(err.message);
        }
      }
      return { data: { authToken, refreshToken, expiresIn, user: { ...user, ...userProfile } }, message: 'Successfully logged in.', errors: null };
    } catch (err) {
      throw err;
    }
  }

  @Put('refresh-token')
  @ApiDescription('Account Refreshed Token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RefreshTokenResponse })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.userService.refreshToken({ email: dto.userId, refreshToken: dto.refreshToken });
  }

  @Post('forgot-password')
  @ApiDescription('Forgot Password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  public async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return await this.userService.forgotPassword(dto);
  }

  @Post('confirm-forgot-password')
  @ApiDescription('Confirmed Forgot Password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ConfirmForgotPasswordResponseDto })
  public async confirmForgotPassword(@Body() dto: ConfirmForgotPasswordRequestDto) {
    return await this.userService.confirmForgotPassword(dto);
  }

  @AuthN()
  @Post('change-password')
  @ApiDescription('Changed Password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  async changePassword(@Req() request: Request, @Body() dto: ChangePasswordRequestDto) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('No authorization header provided.');
      const accessToken = authHeader.replace('Bearer ', '');
      return await this.userService.changePassword({ accessToken, ...dto });
    } catch (err) {
      throw err;
    }
  }

  @AuthN()
  @Put('signout')
  @ApiDescription('Account Sign out')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: SignOutResponseDto })
  async signout(@Req() request: Request) {
    const accessToken = request.headers.authorization.replace('Bearer ', '');
    return await this.authService.signout({ accessToken });
  }
}
