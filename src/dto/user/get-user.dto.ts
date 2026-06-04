import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IUser } from '../../shared/interfaces/user';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetUserRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class GetUserResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      firstName: 'LEv$91200',
      lastName: 'Lily',
      email: 'Evans',
      phoneNumber: '+447975777666',
      defaultRole: 'HOST',
    },
  })
  data: IUser;
}
