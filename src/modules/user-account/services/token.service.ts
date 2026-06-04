import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { VerifyTokenDto, RefreshTokenDto } from '../dto/token';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class TokenService {
  protected readonly logger = new Logger('AUTH_TOKEN_MICROSERVICE');

  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async verifyToken({ token }: VerifyTokenDto) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      return {
        data: {
          userId: payload.userId || payload.sub,
          roles: payload.roles || (payload.role ? [payload.role] : []),
          email: payload.email || null,
        },
        message: '',
        errors: null,
      };
    } catch (err) {
      throw new BadRequestException(err.message || 'Invalid or expired token');
    }
  }

  async refreshToken({ email: userId, refreshToken }: RefreshTokenDto) {
    try {
      const user = await this.userRepository.findOne({ _id: userId });

      if (user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token.');
      }

      const payload = {
        userId: user._id,
        email: Buffer.from(user.email, 'base64').toString('utf-8'),
        role: user.defaultRole,
        roles: [user.defaultRole],
      };

      const newAccessToken = this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '1d',
      });

      const newRefreshToken = this.jwtService.sign(
        { userId: user._id, tokenType: 'refresh' },
        { secret: this.config.get('JWT_REFRESH_SECRET') || this.config.get('JWT_SECRET'), expiresIn: '7d' },
      );

      await this.userRepository.findOneAndUpdate({ _id: user._id }, { refreshToken: newRefreshToken });

      return {
        data: { authToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: 86400 },
        message: 'Successfully refreshed token.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }
}

