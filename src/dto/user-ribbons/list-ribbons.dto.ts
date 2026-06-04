import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ListRibbonsRequestDto {}

export class ListRibbonsResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: [
      {
        userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        title: "Lily's deals",
        userImageId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxxx-xxxxx-xxxx.png',
        category: 'discounts',
        startDate: '22-10-2022',
        endDate: '25-10-2022',
      },
    ],
  })
  data: any;
}
