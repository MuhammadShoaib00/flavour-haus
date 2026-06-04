import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetContractBookPDFLinkDto extends ApiResponseDto {
  @ApiProperty({ example: 'This url will expires soon' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: {
      url: 'https://smd-s3-1.s3........494f8cc&X-Amz-SignedHeaders=host',
    },
  })
  @IsObject()
  data: {
    url: string;
  };
}
