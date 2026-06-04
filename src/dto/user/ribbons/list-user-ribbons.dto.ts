import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/ApiResponse.dto';

export class ListUserRibbonResponse extends ApiResponseDto {
  @ApiProperty({ example: 'create_user_ribbon' })
  message: 'User ribbons retrive successfully';
}
