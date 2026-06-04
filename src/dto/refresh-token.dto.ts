import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from './common/ApiResponse.dto';

export class RefreshTokenDto {
  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  userId: string;

  @ApiProperty({ example: 'eyJhbG.eyJzdWi.....g2h3qof1kw' })
  refreshToken: string;
}

export class RefreshTokenResponse extends ApiResponseDto {
  @ApiProperty({
    example: {
      authToken: 'eyJhbG.eyJzdWi.....yfQ.Sf6yJV_adQssw5c',
      refreshToken: 'exQhbG.enJzdWi.....yzQ.Sf6yJV_xdJssw7N',
      expiresIn: 3600,
    },
  })
  data: any;

  @ApiProperty({ example: 'Successfully logged in.' })
  message: string;
}
