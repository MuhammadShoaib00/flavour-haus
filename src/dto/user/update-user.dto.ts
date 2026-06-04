import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../shared/interfaces/role';
import { IUser } from '../../shared/interfaces/user';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class UpdateUserRequestDto implements Omit<IUser, 'userId' | 'password'> {
  @ApiProperty({ example: 'lily.evans@gmail.com' })
  @IsString()
  @IsNotEmpty()
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

  //New Attributes??
}

export class UpdateUserResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'User updated successfully.',
  })
  message: string;
}
