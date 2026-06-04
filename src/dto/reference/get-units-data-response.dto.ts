import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetWeighingUnitsResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'All Weighing Units' })
  message: string | null;
  @ApiProperty({
    example: 
      [{
        name: "milliliter",
        unit: "ml",
        type: "metric"
    }],
  })
  data: Array<{name: string, unit: string, type: string}>;
  @ApiProperty({ example: 'null' })
  errors: string | null;
}
