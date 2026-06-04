import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto {
  @ApiProperty({
    nullable: true,
    default: null,
  })
  data: any;

  @ApiProperty({
    nullable: true,
    default: '',
  })
  message: string;

  @ApiProperty({
    nullable: true,
    default: null,
  })
  errors: string | object | null;
}
