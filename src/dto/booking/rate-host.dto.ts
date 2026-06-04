import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class RateHostRequestDto {
  // @ApiProperty({ example: '1' })
  // numberOfGuest: Number;
  @ApiProperty({ example: 'host is good' })
  @IsString()
  @IsNotEmpty()
  review: String;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  diningSpace: Number;
  @ApiProperty({ example: '3' })
  @IsNumber()
  @IsNotEmpty()
  hygineLevel: Number;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  portaion: Number;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  taste: Number;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  foodQuality: Number;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  professionalism: Number;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  timeliness: Number;
  @ApiProperty({ example: '3' })
  @IsNotEmpty()
  @IsNumber()
  reasonableAdjustment: Number;
  // @ApiProperty({ example: '3.5' })
  // rating:Number
}

  export class RateHostResponseDto extends ApiResponseDto {
    @ApiProperty({ example: 'Rate Host succesfully.' })
    @IsString()
    message: string;
  } 