import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/ApiResponse.dto';

export class CreateUserRibbons {
  @ApiProperty({ example: ' my halal food' })
  title: string;

  @ApiProperty({ example: 'halal' })
  category: string;

  @ApiProperty({ example: '18-jul-2996' })
  startDate: string;

  @ApiProperty({ example: '18-jul-2996' })
  endDate: string;
}

export class CreateUserRibbonsResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'create_user_ribbon' })
  message: 'User ribbon created successfully';
}
