import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ResendLinkRequestDto {
  @ApiProperty({ example: 'xxxxx-xxxxxxx-xxxxx-xxx' })
  userId: string;
}

export class ResendLinkResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Link is resent. Kindly check your email address.' })
  message: string;
}
