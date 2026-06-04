import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../shared/interfaces/role';
import { IUser } from '../../shared/interfaces/user';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ResendPasswordRequestDto {
  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ResendPasswordResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'Password resent successfully.',
  })
  @IsString()
  message: string;
}
