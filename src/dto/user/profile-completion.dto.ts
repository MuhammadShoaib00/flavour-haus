import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ProfileCompletionDto extends ApiResponseDto {
  @ApiProperty({ example: 'Profile Completion Updated Successfully' })
  message: string;

//   @ApiProperty({
//     example: {
//         url: "https://smd-s3-1.s3........494f8cc&X-Amz-SignedHeaders=host"
//     }
//   })
//   data: {
//     url: string
//   }
}
