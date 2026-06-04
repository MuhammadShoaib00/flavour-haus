import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from './common/ApiResponse.dto';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'lily.evans@gmail.com' })
  email: string;
}

export class ForgotPasswordResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Check your email to reset password.' })
  message: string;
}
