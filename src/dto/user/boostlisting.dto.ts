import { ApiResponseDto } from "../common/ApiResponse.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class BoostListingDTO {

  @ApiProperty({ example: '2022-01-10' })
  @IsString()
  startDate: string;


  @ApiProperty({ example: '2022-01-10' })
  @IsString()
  endDate: string;
}

export class BoostListingSuccess extends ApiResponseDto {
  @ApiProperty({
    example: 'All published listing are boosted',
  })
  @IsString()
  message: string;
}
