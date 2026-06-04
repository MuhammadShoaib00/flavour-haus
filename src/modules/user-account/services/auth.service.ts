import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  ChangePasswordDto,
  ConfirmForgotPasswordDto,
  ForgotPasswordDto,
  GetUserInfoDto,
  ResendLinkDto,
  SigninDto,
  SignOutDto,
  VerifyEmailDto,
} from '../dto/auth';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthService {
  protected readonly logger = new Logger('AUTH_MICROSERVICE');

  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  public async verifyEmail(data: VerifyEmailDto) {
    const { userId, code } = data;
    try {
      const user = await this.userRepository.findOne({ _id: userId });
      if (user.verificationCode !== code) {
        throw new Error('Invalid verification code.');
      }
      await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { isEmailVerified: true, $unset: { verificationCode: '' } },
      );
      return {
        data: null,
        message: 'Your email address is verified successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  public async forgotPassword(data: ForgotPasswordDto) {
    try {
      const { email } = data;
      const user = await this.userRepository.findOne({
        email: Buffer.from(email).toString('base64'),
      });

      const resetToken = this.jwtService.sign(
        { userId: user._id, email, tokenType: 'reset' },
        {
          secret:
            this.config.get('JWT_RESET_SECRET') ||
            this.config.get('JWT_SECRET'),
          expiresIn: '1d',
        },
      );

      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        { resetToken },
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

      let payload: any;
      try {
        payload = this.jwtService.verify(code, {
          secret:
            this.config.get('JWT_RESET_SECRET') ||
            this.config.get('JWT_SECRET'),
        });
      } catch {
        throw new Error('Invalid or expired reset token.');
      }

      const user = await this.userRepository.findOne({ _id: payload.userId });
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        { password: hashedPassword, $unset: { resetToken: '' } },
      );

      return {
        data: null,
        message: 'Your password have been successfully changed.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  public async resendLink(data: ResendLinkDto) {
    try {
      return {
        data: null,
        message: 'Link is resent. Kindly check your email address.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  public async signin(data: SigninDto) {
    const { email, password } = data;
    try {
      const user = await this.userRepository.findOne({
        email: Buffer.from(email).toString('base64'),
      });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials.');
      }

      const payload = {
        userId: user._id,
        email,
        role: user.defaultRole,
        roles: [user.defaultRole],
      };

      const authToken = this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '1d',
      });

      const refreshToken = this.jwtService.sign(
        { userId: user._id, tokenType: 'refresh' },
        {
          secret:
            this.config.get('JWT_REFRESH_SECRET') ||
            this.config.get('JWT_SECRET'),
          expiresIn: '7d',
        },
      );

      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        { refreshToken },
      );

      return {
        authToken,
        refreshToken,
        expiresIn: 86400,
        user: {
          userId: user._id,
          email,
          role: user.defaultRole,
          roles: [user.defaultRole],
        },
      };
    } catch (err) {
      throw err;
    }
  }

  public async getUserInfo(data: GetUserInfoDto) {
    const { accessToken } = data;
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      const user = await this.userRepository.findOne({ _id: payload.userId });

      return {
        data: {
          userId: user._id,
          email: Buffer.from(user.email, 'base64').toString('utf-8'),
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          defaultRole: user.defaultRole,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        },
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  public async signout(data: SignOutDto) {
    const { accessToken } = data;
    try {
      try {
        const payload = this.jwtService.verify(accessToken, {
          secret: this.config.get('JWT_SECRET'),
        });
        if (payload?.userId) {
          await this.userRepository.findOneAndUpdate(
            { _id: payload.userId },
            { $unset: { refreshToken: '' } },
          );
        }
      } catch {
        // Token already expired or invalid â€” sign out gracefully
      }

      return {
        data: null,
        message: 'Successfully logged out.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  public async changePassword(data: ChangePasswordDto) {
    try {
      const { accessToken, oldPassword, newPassword } = data;

      const payload = this.jwtService.verify(accessToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      if (!payload?.userId) {
        throw new Error('Invalid or expired token.');
      }

      const user = await this.userRepository.findOne({ _id: payload.userId });

      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new Error('Incorrect password.');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.findOneAndUpdate(
        { _id: payload.userId },
        { password: hashedNewPassword },
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
}

