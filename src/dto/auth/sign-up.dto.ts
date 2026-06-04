import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../shared/interfaces/role';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class SignupRequestDto {
  @ApiProperty({ example: 'lily.evans@gmail.com' })
  email: string;

  @ApiProperty({ example: 'LEv$91200' })
  password: string;

  @ApiProperty({ example: 'Lily' })
  firstName: string;

  @ApiProperty({ example: 'Evans' })
  lastName: string;

  @ApiProperty({ example: '+447975777666' })
  phoneNumber: string;

  @ApiProperty({ example: 'HOST', enum: [Role.HOST, Role.GUEST] })
  defaultRole: Role;
}

export class SignupResponseDto extends ApiResponseDto {
  @ApiProperty({
    default: {
      userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      emailSent: true,
    },
  })
  data: any;

  @ApiProperty({
    default: 'User signed up successfully. Welcome email sent.',
  })
  message: string;
}
