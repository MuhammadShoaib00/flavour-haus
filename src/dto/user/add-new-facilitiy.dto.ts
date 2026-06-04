import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  ApiMultipleFiles,
  ApiSingleFile,
} from '../../shared/decorators/custom';
// '../../shared/decorators/custom';

enum PurchasableType {
  'Standout Facilities' = 'Standout Facilities',
  'Disability Arrangements' = 'Disability Arrangements',
  'Kid-Friendly Arrangements' = 'Kid-Friendly Arrangements',
  'Pet-Friendly Arrangements' = 'Pet-Friendly Arrangements',
}

export class AddFacilityRequestDto {
  @ApiProperty({
    example:
      'Standout Facilities | Disability Arrangements | Kid-Friendly Arrangements | Pet-Friendly Arrangements',
  })
  @IsEnum(PurchasableType)
  @IsNotEmpty()
  category: PurchasableType;

  @ApiProperty({ example: 'xxxx' })
  @IsNotEmpty()
  @IsString()
  name: string;
  // @ApiProperty({ example: 'xxxx' })
  // icon: string;
  @ApiSingleFile({ required: false })
  // @IsNotEmpty()
  icon?: any;
}

export class AddFacilityResponceDto {
  @ApiProperty({
    nullable: true,
  })
  errors: string | object | null;
  @ApiProperty({
    nullable: true,
  })
  message: string;
  @ApiProperty({
    nullable: true,
  })
  data: any;
}
