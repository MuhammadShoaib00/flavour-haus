import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class VerifyEmailRequestDto {
  email: string;
  code: string;
}

export class VerifyEmailResponseDto extends ApiResponseDto {
  @ApiProperty({
    default: 'Your email address is verified successfully.',
  })
  message: string;
}
