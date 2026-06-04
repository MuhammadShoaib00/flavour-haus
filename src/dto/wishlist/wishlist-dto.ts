import { ApiProperty } from '@nestjs/swagger';

import { ApiSingleFile } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CreateWishlistRequestDto {
  @ApiProperty({ example: 'My favrouit host' })
  name: string;
  @ApiProperty({ example: 'Host' })
  category: string;
  @ApiSingleFile({ required: true })
  imageFile: any;
}

export class CreateWishlistResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'added successfully.' })
  message: string;
}
