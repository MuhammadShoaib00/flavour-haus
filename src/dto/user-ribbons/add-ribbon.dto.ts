import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class AddRibbonRequestDto {
  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: "Lily's deals" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'bvcxxxxxxxxxxx2ff3' })
  @IsNotEmpty()
  @IsString()
  ribbonImage: string;

  @ApiProperty({ example: 'discounts' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: '70%' })
  @IsNotEmpty()
  @IsString()
  offer: string;

  @ApiProperty({ example: '2022-12-04T19:00:00.000Z' })
  @IsNotEmpty()
  // @IsString()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2022-12-05T19:00:00.000Z' })
  @IsNotEmpty()
  // @IsString()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class AddRibbonResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Ribbon added successfully.' })
  message: string;
}
