import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class SelectCoverPhotoRequestDto {
  @ApiProperty({ example: 'xxxx-xxxx-xxxxxxx-xxxxx' })
  @IsString()
  @IsNotEmpty()
  kitchenId: string;

  @ApiProperty({
    example:
      'users/xxxxxxxx-xxxxx-xxxxxxx-xxxx/kitchen/cover-photos/xxxxxxxx-xxxx-xxxxxxxxxx.png',
  })
  @IsNotEmpty()
  @IsString()
  coverPhotoUrl: string;
}

export class SelectCoverPhotoResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'Selected the cover photo for the kitchen successfully.',
  })
@IsString()
  message: string;
}
