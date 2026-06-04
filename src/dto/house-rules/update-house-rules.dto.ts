import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { isBoolean } from 'util';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class UpdateHouseRulesRequestDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  foodRestrictionApplied?: boolean;
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  smokingRestrictionApplied?: boolean;
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  dressCodeRestrictionApplied?: boolean;
  @ApiProperty({ example: 'Please wear a formal dress.' })

  dressCodeRestriction?: string;
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  petsRestrictionApplied?: boolean;
}

export class UpdateHouseRulesResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'House rules updated successfully.' })
  message: string;
}
