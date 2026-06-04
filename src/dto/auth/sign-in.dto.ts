import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../shared/interfaces/role';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class SigninRequestDto {
  @ApiProperty({ example: 'host@yopmail.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'LEv$91200', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SigninResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      authToken: 'eyJhbG.eyJzdWi.....yfQ.Sf6yJV_adQssw5c',
      refreshToken: 'exQhbG.enJzdWi.....yzQ.Sf6yJV_xdJssw7N',
      expiresIn: 3600,
      user: {
        userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        roles: ['HOST'],
        email: 'email@host.com',
      },
    },
  })
  data: any;

  @ApiProperty({ example: 'Successfully logged in.' })
  message: string;
}
