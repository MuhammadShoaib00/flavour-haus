import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiSingleFile } from '../../shared/decorators/custom';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class UpdateDBSInfoRequestDto {
  @ApiSingleFile({ required: true })
  dbsFile: string;

  @ApiProperty({ example: true, required: true })
  @IsNotEmpty()
  dbsStatus: boolean;
}

export class UpdateDBSInfoResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'DBS info updated successfully.' })
  message: string;

  @ApiProperty({
    nullable: true,
    example: {
      _id: 'cb59cbd-------1',
      dbsCheck: {
        file: 'base64_image',
        status: true,
      },
    },
  })
  data: any;
}

export class getDBSInfoResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'DBS info.' })
  @IsString()
  message: string;

  @ApiProperty({
    nullable: true,
    example: {
      _id: 'cb59cbd-------1',
      dbsCheck: {
        file: 'base64_image',
        status: true,
      },
    },
  })
  data: any;
}
