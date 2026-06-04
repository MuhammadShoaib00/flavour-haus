import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'LEv$91200' })
  oldPassword: string;
  
  @ApiProperty({ example: 'Lily@7899' })
  newPassword: string;
}

export class ChangePasswordResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Your password has been successfully changed.' })
  message: string;
}
