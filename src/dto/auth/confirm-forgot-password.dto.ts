import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ConfirmForgotPasswordRequestDto {
  @ApiProperty({ example: 'lily.evans@gmail.com' })
  email: string;
  @ApiProperty({ example: 'LEv$91200' })
  password: string;
  @ApiProperty({ example: '789124' })
  code: string;
}

export class ConfirmForgotPasswordResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Your password have been successfully changed.' })
  message: string;
}
