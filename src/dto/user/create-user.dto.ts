import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../shared/interfaces/role';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'lily.evans@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  
  @ApiProperty({ example: 'Lily' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Evans' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+447975777666' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'HOST', enum: Role })
  @IsNotEmpty()
  @IsString()
  defaultRole: string;
}

export class CreateUserResponseDto extends ApiResponseDto {
  @ApiProperty({
    default: {
      userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      emailSent: true,
    },
  })
  data: any;

  @ApiProperty({
    example: 'User created successfully. Temporary password email sent.',
  })
  @IsString()
  message: string;
}
