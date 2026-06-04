import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import {
  ChangePasswordDto,
  ConfirmForgotPasswordDto,
  CreateUserDto,
  DeleteUserDto,
  ForgotPasswordDto,
  GetUserDto,
  RefreshTokenDto,
  SigninDto,
  SignOutDto,
  SignupDto,
  UpdateUserDto,
} from '../dto/user';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from '../shared/services/s3.service';
import { EmailService } from '../shared/services/email.service';
import { FacilityRepository } from '../repositories/facilities.repository';
import { ContractBookService } from './contract-book.service';
import { KitchenRepository } from '../repositories/kitchen.repository';
import { UserAuditService } from './user_audit.service';
import { Types } from 'mongoose';
import { UserAuditTypeEnum } from '../interfaces/user-audit.enum';
import { AssignRightsDto } from '../dto/user/assign-rights.dto';
import { AACApiDto } from '../dto/user/aac-api.dto';
import { AACLeadGenerationService } from './acc-api.service';

@Injectable()
export class UserService {
  protected readonly logger = new Logger(UserService.name);

  constructor(
    private userRepository: UserRepository,
    private userAuditService: UserAuditService,
    private s3: S3Service,
    private facilityRepository: FacilityRepository,
    private kitchenRepository: KitchenRepository,
    private readonly contractBookService: ContractBookService,
    private aacApi: AACLeadGenerationService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async listUsers(payload: {
    role: string;
    search: string;
    limit: number;
    offset: number;
    userFromCognito?: Array<string> | null;
  }) {
    try {
      const { role, search, limit, offset, userFromCognito } = payload;

      let filterQuery: any = {};

      if (search != null && search.length > 0) {
        filterQuery.$or = [
          { firstName: { $regex: search?.toLowerCase(), $options: 'i' } },
          { lastName: { $regex: search?.toLowerCase(), $options: 'i' } },
        ];
      }

      if (userFromCognito != null && userFromCognito.length > 0) {
        filterQuery._id = { $in: userFromCognito };
      }

      if (role != null && role != '') {
        filterQuery.defaultRole = { $eq: role };
      }

      let users = await this.userRepository.adminListUsers(
        filterQuery,
        limit,
        offset,
      );
      users?.users?.map((user) => {
        user.email = Buffer.from(user?.email, 'base64').toString('ascii');
        return user;
      });
      return users;
    } catch (err) {
      throw err;
    }
  }

  async signin(data: SigninDto) {
    const { email, password } = data;

    try {
      // 1. Find user by email
      const user = await this.userRepository.findOne({ email: Buffer.from(email).toString('base64') });
      if (!user) {
        throw new Error('User does not exist.');
      }

      // 2. Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials.');
      }

      // 3. Generate JWT token
      const payload = {
        userId: user._id,
        email: email,
        role: user.defaultRole,
        roles: [user.defaultRole],
      };

      const authToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      });

      // 4. Generate refreshToken (UUID or JWT with long expiry)
      const refreshToken = this.jwtService.sign(
        { userId: user._id, tokenType: 'refresh' },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );

      // 5. Save refreshToken in DB
      await this.userRepository.findOneAndUpdate(
        { _id: payload.userId },
        { refreshToken },
      );

      // 6. Return tokens and user info
      return {
        authToken,
        refreshToken,
        expiresIn: 86400, // seconds for 1d
        user: payload,
      };
    } catch (err) {
      throw err;
    }
  }

  async refreshToken({ email, refreshToken }: RefreshTokenDto) {
    try {
      // 1. Find user by email
      const user = await this.userRepository.findOne({ _id: email });
      if (!user) {
        throw new Error('User does not exist.');
      }

      // 2. Validate refreshToken matches (if you store hashed tokens, compare hashes)
      if (user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token.');
      }

      // 3. Generate new accessToken
      const payload = { userId: user._id, email: user.email, role: user.defaultRole };
      const newAccessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      });

      // 4. Generate new refreshToken (UUID or JWT with long expiry)
      const refrshToken = this.jwtService.sign(
        { userId: user._id, tokenType: 'refresh' },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );

      // 5. Save refreshToken in DB
      await this.userRepository.findOneAndUpdate(
        { _id: payload.userId },
        { refreshToken: refrshToken },
      );

      return {
        data: {
          authToken: newAccessToken,
          refreshToken: refreshToken, // or newRefreshToken if rotated
          expiresIn: 86400, // 1d in seconds
        },
        message: 'Successfully refreshed token.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getUser(dto: GetUserDto) {
    try {
      const { userId } = dto;
      const user = await this.userRepository.findOne(
        { _id: userId },
        { 'license.premisesPermissionFile': 0, 'dbsCheck.file': 0 },
      );
      const { _id, ...data } = user;
      !!data.email &&
        (data.email = Buffer.from(data?.email, 'base64').toString('ascii'));

      return {
        data: Object.assign({ userId }, Object(data)),
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getUserForAuth(dto: GetUserDto) {
    try {
      const { userId } = dto;
      const user = await this.userRepository.findOne(
        { _id: userId },
        {
          dbsCheck: 0,
          license: 0,
          contractBookData: 0,
          profileCompletion: 0,
          overalProfileCompletion: 0,
          language: 0,
          city: 0,
          address: 0,
          aboutMe: 0,
          country: 0,
          dob: 0,
          // profileImage: 0,
          gender: 0,
        },
      );
      const { _id, ...data } = user;
      !!data.email &&
        (data.email = Buffer.from(data?.email, 'base64').toString('ascii'));

      return {
        data: Object.assign({ userId }, Object(data)),
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getLimitedInfoAboutHot(dto: GetUserDto) {
    try {
      const { userId } = dto;

      const user = await this.userRepository.findOne(
        { _id: userId },
        {
          totalReview: 1,
          avgRating: 1,
          firstName: 1,
          lastName: 1,
          aboutMe: 1,
          profileImage: 1,
          createdAt: 1,
        },
      );
      return {
        data: Object.assign({ userId }, Object(user)),
        message: '',
        errors: null,
      };
    } catch (e) {
      throw e;
    }
  }

  async getComplianceDashboard(_params?: any): Promise<any> {
    return null;
  }

  async getUserEssentials(dto: GetUserDto) {
    try {
      const { userId } = dto;
      const user = await this.userRepository.findOne(
        { _id: userId },
        { _id: 1, email: 1, firstName: 1, lastName: 1 },
      );
      const { _id, ...data } = user;
      !!data.email &&
        (data.email = Buffer.from(data?.email, 'base64').toString('ascii'));
      return {
        userId,
        ...data,
      };
    } catch (err) {
      throw err;
    }
  }

  async createUser(dto: CreateUserDto) {
    try {
      const { userId, password, ...user } = dto;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (user.defaultRole == 'HOST') {
        user.isHostConfirmed = false;
        const { profileCompletion, overall } = await this.profileCompletion(
          user?.profileCompletion,
          null,
          true,
        );
        user.profileCompletion = profileCompletion;
        user.overalProfileCompletion = overall;
      }

      await this.userRepository.create({
        _id: userId,
        password: hashedPassword,
        ...user
      });
      const decodedEmail = Buffer.from(user.email, 'base64').toString('utf-8');
      let emailSent = false;

      try {
        await this.emailService.sendMail(
          decodedEmail,
          'Welcome to Flavor Haus',
          `
            <p>Hello ${user.firstName || 'there'},</p>
            <p>Your Flavor Haus account has been created successfully.</p>
            <p>You can now sign in using this email address.</p>
          `,
        );
        emailSent = true;
      } catch (err) {
        this.logger.warn(`Signup email was not sent to ${decodedEmail}: ${err.message}`);
      }

      return {
        data: { _id: userId, emailSent },
        message: emailSent
          ? 'User signed up successfully. Welcome email sent.'
          : 'User signed up successfully, but welcome email could not be sent.',
        errors: null,
      };
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.email) {
        throw new HttpException('Email already exists.', 409);
      }
      throw err;
    }
  }

  public async signout(data: SignOutDto) {
    const { accessToken } = data;
    try {
      // 1. Verify token to extract user (optional if you want to log the userId)
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      // 2. If you maintain a token blacklist or session store, add it there here.
      // Example (pseudo-code):
      // await this.tokenBlacklistService.add(accessToken);

      // Otherwise, token will simply expire after its duration.

      return {
        data: null,
        message: 'Successfully logged out.',
        errors: null,
      };
    } catch (err) {
      // If token invalid or expired, still return success for idempotency
      return {
        data: null,
        message: 'Successfully logged out.',
        errors: null,
      };
    }
  }



  public async changePassword(data: ChangePasswordDto) {
    try {
      const { accessToken, oldPassword, newPassword } = data;
      // 1. Verify the access token to get user info
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload || !payload.userId) {
        throw new Error('Invalid or expired token.');
      }

      // 2. Find user by userId
      const user = await this.userRepository.findOne({ _id: payload.userId });
      if (!user) {
        throw new Error('User does not exist.');
      }

      // 3. Validate old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Incorrect old password.');
      }

      // 4. Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 5. Update user password in DB
      await this.userRepository.findOneAndUpdate(
        { _id: payload.userId },
        { password: hashedNewPassword },
      );

      const decodedEmail = await Buffer.from(user.email, 'base64').toString('utf-8');

      // 6. Send email
      await this.emailService.sendMail(
        decodedEmail,
        'Change Password Confirmation',
        '<p>Hello, your password changed successfully!</p>',
      );

      return {
        data: null,
        message: 'Your password has been successfully changed.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async verifyToken({ token }: { token: string }) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return { data: decoded };
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  public async forgotPassword(data: ForgotPasswordDto) {
    try {
      const { email } = data;

      // 1. Find user by email
      const user = await this.userRepository.findOne({ email: Buffer.from(email).toString('base64') });
      if (!user) {
        throw new Error('User does not exist.');
      }

      // 2. Generate reset token (JWT with short expiry e.g. 1d)
      const resetToken = this.jwtService.sign(
        { userId: user._id, email: email, tokenType: 'reset' },
        {
          secret: process.env.JWT_RESET_SECRET,
          expiresIn: '1d',
        },
      );

      // 3. Optionally save token in DB for validation (optional)
      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        { resetToken }
      );

      // 4. Send reset link via email
      await this.emailService.sendMail(email, 'Forgot Password',
        `<p>Hello ${user.firstName},</p>
   <p>Please click the link below to reset your password:</p>
   <p><a href="${process.env.APP_URL}/authentication/reset-password?token=${resetToken}">Reset Password</a></p>
   <p>If you did not request this, you can safely ignore this email.</p>`
      );

      return {
        data: null,
        message: 'Check your email to reset password.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  public async confirmForgotPassword(data: ConfirmForgotPasswordDto) {
    try {
      const { code, password } = data;

      // 1. Verify reset token
      let payload: any;
      try {
        payload = this.jwtService.verify(code, {
          secret: process.env.JWT_RESET_SECRET,
        });
      } catch (err) {
        throw new Error('Invalid or expired reset token.');
      }

      // 2. Find user by ID from token payload
      const user = await this.userRepository.findOne({ _id: payload.userId });
      if (!user) {
        throw new Error('User does not exist.');
      }

      // 3. Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Update password and remove reset token if stored in DB
      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        {
          password: hashedPassword,
          $unset: { resetToken: "" }, // if you store resetToken in DB
        },
      );

      const decodedEmail = await Buffer.from(user.email, 'base64').toString('utf-8');

      // 5. Send email
      await this.emailService.sendMail(
        decodedEmail,
        'Change Password Confirmation',
        `<p>
            Hello,Your password has been changed successfully. 
            If you made this change, no further action is needed. 
            If you did not change your password, please reset it immediately and contact our support team to secure your account. 
            Thank you for keeping your account secure.
         </p>`,
      );

      return {
        data: null,
        message: 'Your password has been successfully changed.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }


  async checkPhoneNumber(dto: { phoneNumber: string; userId?: string }) {
    try {
      const { phoneNumber, userId } = dto;
      try {
        let filter: any = {};
        if (userId != null && userId != undefined) {
          filter = { phoneNumber: phoneNumber, _id: { $ne: userId } };
        } else {
          filter = { phoneNumber: phoneNumber };
        }
        await this.userRepository.findOne(
          { ...filter },
          { _id: 1, phoneNumber: 1, defaultRole: 1 },
        );
        return true;
      } catch (exception) {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  async updateUser(dto: UpdateUserDto) {
    try {
      const { userId, ...user } = dto;
      return await this.userRepository.findOneAndUpdate({ _id: userId }, user, {
        projection: { license: 0, dbsCheck: 0 },
      });
    } catch (err) {
      throw err;
    }
  }

  async deleteUser(dto: DeleteUserDto) {
    try {
      const { userId } = dto;
      await this.userRepository.delete({ _id: userId });
      return {
        data: null,
        message: 'User deleted successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async postPersonalInfo(params: any) {
    try {
      const { userId, userIsHost, ...user } = params.dto;
      let dbUser = await this.userRepository.findOne(
        { _id: userId },
        {
          'license.premisesPermissionFile': 0,
          'dbsCheck.file': 0,
          userPermissions: 0,
        },
      );
      dbUser = { ...dbUser, ...user };
      await this.userRepository.findOneAndUpdate({ _id: dbUser._id }, dbUser);
      if (userIsHost) {
        let lan: any = [];
        let { language } = user;
        language.forEach((item) => {
          lan.push(item.languageName);
        });
        await this.kitchenRepository.findOneAndUpdate(
          { userId: userId },
          { language: lan },
        );
      }
      return {
        error: null,
        message: 'User personal info saved',
        data: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async profileCompletion(
    profile: any,
    type: string | null,
    onlyObject: boolean | null | undefined = false,
  ) {
    let overall = 10;
    const profileCompletion = {
      personalInfo: {
        required: true,
        percentage: 15,
        completed: profile?.personalInfo?.completed || false,
      },
      licenses: {
        required: true,
        percentage: 15,
        completed: profile?.licenses?.completed || false,
      },
      idVerification: {
        required: true,
        percentage: 15,
        completed: profile?.idVerification?.completed || false,
      },
      kitchenDetails: {
        required: true,
        percentage: 10,
        completed: profile?.kitchenDetails?.completed || false,
      },
      trainings: {
        required: false,
        percentage: 15,
        completed: profile?.trainings?.completed || false,
      },
      ribbons: {
        required: false,
        percentage: 5,
        completed: profile?.ribbons?.completed || false,
      },
      badges: {
        required: false,
        percentage: 5,
        completed: profile?.badges?.completed || false,
      },
      facilities: {
        required: false,
        percentage: 5,
        completed: profile?.facilities?.completed || false,
      },
      houseRules: {
        required: false,
        percentage: 5,
        completed: profile?.houseRules?.completed || false,
      },
    };
    if (onlyObject) {
      return {
        overall,
        profileCompletion,
      };
    }
    for (const key in profileCompletion) {
      if (key == type) {
        profileCompletion[key].completed = true;
      }
      if (profileCompletion[key].completed === true) {
        overall += profileCompletion[key].percentage;
      }
    }
    return {
      overall,
      profileCompletion,
      hostConfirmed:
        profileCompletion.personalInfo.completed === true &&
          profileCompletion.idVerification.completed === true &&
          profileCompletion.licenses.completed === true &&
          overall >= 60
          ? true
          : false,
    };
  }

  async updateProfileCompletion(payload: { hostId: string; key: string }) {
    try {
      const { hostId, key } = payload;
      const dbUser = await this.userRepository.findOne(
        { _id: hostId },
        {
          firstName: 1,
          lastName: 1,
          address: 1,
          country: 1,
          city: 1,
          profileImage: 1,
          profileCompletion: 1,
          overalProfileCompletion: 1,
          isHostConfirmed: 1,
        },
      );
      const completion = await this.profileCompletion(
        dbUser.profileCompletion,
        key,
      );
      dbUser.overalProfileCompletion = completion.overall;
      dbUser.profileCompletion = completion.profileCompletion;
      if (completion.hostConfirmed) {
        dbUser.isEligibleForAudit = true;
        const kitchen = await this.kitchenRepository.findOne(
          { userId: hostId },
          { _id: 1, name: 1, location: 1 },
        );

        try {
          await this.userAuditService.getSingleAudit({
            filterQuery: {
              hostId: dbUser._id,
              $or: [
                { auditType: null },
                { auditType: UserAuditTypeEnum.INITIAL_VISIT },
              ],
            },
          });
        } catch (err) {
          await this.userAuditService.assignAudit({
            kitchenId: new Types.ObjectId(kitchen._id),
            kitchenName: kitchen.name,
            hostId,
            hostName: `${dbUser.firstName} ${dbUser.lastName}`,
            hostProfileImage: dbUser.profileImage,
            address:
              (<any>kitchen.location?.address)?.locationName ||
              kitchen.location?.address,
            latitude: kitchen?.location?.latitude,
            longitude: kitchen?.location?.longitude,
            country: dbUser.country,
            city: dbUser.city,
          });
        }
      }
      await this.userRepository.findOneAndUpdate({ _id: dbUser._id }, dbUser);
      return dbUser;
    } catch (err) {
      throw err;
    }
  }

  async addNewFacility(params: any) {
    try {
      let data = await this.s3.uploadFile<{ selected: boolean }>(
        params.icon,
        `icons/facilties/user/{uuid}`,
      );

      if (data) {
        let dto = params.dto;
        await this.facilityRepository.create({
          icon: data.url,
          imageName: dto.name,
          category: dto.category,
          userId: params.user,
        });
        return {
          error: null,
          message: 'Facility Added',
          data: null,
        };
      }
    } catch (err) {
      throw err;
    }
  }

  async listFacility(params: any) {
    try {
      let dbUser = await this.facilityRepository.find({
        $or: [{ userId: null }, { userId: params.userId }],
      });
      return {
        error: null,
        data: dbUser,
        message: 'Facilities list',
      };
    } catch (err) {
      throw err;
    }
  }

  async postLicenseInfo(params: any) {
    try {
      const dto = params.dto;
      const userId = params.userId;
      const image = params.permissionFile;
      let { data: dbUser } = await this.getUser({
        userId: userId,
      });
      if (image != null && image != '') {
        const url = `users/${userId}/profile/{uuid}`;
        dto.premisesPermissionFile = (
          await this.s3.uploadFile(image, url, null, 'private')
        )?.url;
      }
      dbUser.license = dto;
      await this.userRepository.findOneAndUpdate({ _id: userId }, dbUser);
      return dbUser.license;
    } catch (err) {
      throw err;
    }
  }

  async updateDBSInfo(hostId: string, dbsFile: any, dbsStatus: boolean) {
    try {
      await this.userRepository.findOne({ _id: hostId });

      if (dbsFile != null && dbsFile != '') {
        const url = `users/${hostId}/profile/{uuid}`;
        dbsFile = (await this.s3.uploadFile(dbsFile, url, null, 'private'))
          ?.url;
      }
      return await this.userRepository.findOneAndUpdate(
        { _id: hostId },
        { dbsCheck: { file: dbsFile, status: dbsStatus } },
        { projection: { dbsCheck: 1 } },
      );
    } catch (err) {
      throw err;
    }
  }

  async getDBSInfo(hostId: string) {
    try {
      const user = await this.userRepository.findOne(
        { _id: hostId },
        { dbsCheck: 1 },
      );
      if (user.dbsCheck != undefined && user.dbsCheck != null) {
        const file = user.dbsCheck.file;

        if (file != null && file != undefined && file != '') {
          user.dbsCheck.file = await this.s3.getSignedUrl(file);
        }
      }
      return user;
    } catch (err) {
      throw err;
    }
  }

  async getLicenseInfo(hostId: string) {
    try {
      const user = await this.userRepository.findOne(
        { _id: hostId },
        { license: 1, contractBookData: 1 },
      );
      const file = user?.license?.premisesPermissionFile;
      if (file != null && file != undefined && file != '') {
        user.license.premisesPermissionFile = await this.s3.getSignedUrl(file);
      }
      return user;
    } catch (err) {
      throw err;
    }
  }

  async signContract(payload: { hostId: string; email: string }) {
    const { hostId, email } = payload;
    try {
      const user = (await this.getUser({ userId: hostId })).data;
      const { firstName, lastName, address } = user;
      const template = await this.contractBookService.getContractTemplate();
      const owner = template['contract-template'].owner;

      const data = {
        contract: {
          parties: [
            {
              type: 'company',
              full_name: owner.full_name,
              company_representative: owner.full_name,
              company_name: 'Flavor Haus',
              email: owner.email,
              already_signed_up: true,
            },
            {
              type: 'personal',
              full_name: `${firstName} ${lastName}`,
              email: email,
              address: address,
              personal_number: hostId,
            },
          ],
          message: {
            subject: 'Flavor Haus Licence Agreement',
            content: 'Please sign the license agreement!',
          },
        },
      };

      const contract =
        await this.contractBookService.createContractFromTemplate(data);
      user.contractBookData = {
        id: contract.contract.id,
        title: contract.contract.title,
        status: contract.contract.state,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await this.updateUser(user);
    } catch (err) {
      throw err;
    }
  }

  async getContractBookPdfLink(payload: { userId: string }) {
    const { userId } = payload;
    try {
      const user = await this.userRepository.findOne(
        { _id: userId },
        { contractBookData: 1 },
      );
      const file = user?.contractBookData?.data?.file;

      let fileLink = null;
      if (file != null && file != undefined && file != '') {
        fileLink = await this.s3.getSignedUrl(file);
      }
      return fileLink;
    } catch (err) {
      throw err;
    }
  }

  async updateProfileImage(payload: { userId: string; image: any }) {
    const { image, userId } = payload;
    try {
      const user = await this.userRepository.findOne({ _id: userId });
      if (image != null && image != '') {
        const url = `users/${userId}/profile/{uuid}`;
        user.profileImage = (await this.s3.uploadFile(image, url))?.url;

        // deleting old profile image after success
        // if (old_image != undefined && old_image != null && old_image != '') {
        //   await this.s3.deleteFile(old_image);
        // }
        await this.userRepository.findOneAndUpdate({ _id: userId }, user);
        return user.profileImage;
      }
      throw new BadRequestException('Image not provided');
    } catch (err) {
      throw err;
    }
  }

  async getUserPermissions(payload: { userId: string }) {
    const { userId } = payload;
    try {
      return await this.userRepository.findOne(
        { _id: userId },
        { userPermissions: 1, _id: 1 },
      );
    } catch (err) {
      throw err;
    }
  }

  async assignUserPermissions(payload: AssignRightsDto) {
    try {
      return await this.userRepository.findOneAndUpdate(
        { _id: payload.userId },
        { userPermissions: payload.rights },
        { projection: { userPermissions: 1, _id: 1 } },
      );
    } catch (err) {
      throw err;
    }
  }

  async adminChangeStatus(payload: any) {
    try {
      return await this.userRepository.findOneAndUpdate(
        { _id: payload.userId },
        { isActive: payload.isActive },
      );
    } catch (err) {
      throw err;
    }
  }

  async sendLeadGeneration(payload: AACApiDto) {
    return this.aacApi.createLead(payload);
  }
}

