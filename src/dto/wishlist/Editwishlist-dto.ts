import { ApiProperty } from '@nestjs/swagger';

import { ApiSingleFile } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class EditWishlistRequestDto {
  @ApiProperty({ example: 'My favrouit host' })
  name: string;
  @ApiProperty({ example: 'Host' })
  category: string;
  @ApiSingleFile({ required: true })
  imageFile: any;
}

export class CreateWishlistResponseDto extends ApiResponseDto {
  @ApiProperty({ example: ' Edit successfully.' })
  message: string;
}
