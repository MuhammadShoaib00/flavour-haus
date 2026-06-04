import { ApiProperty } from '@nestjs/swagger';

export class PageLimitDto {
  @ApiProperty({
    nullable: true,
    default: 10,
    required: true,
  })
  limit: number;
}
export class PageLimitDtoReview {
  @ApiProperty({
    nullable: true,
    default: 2,
    required: true,
  })
  limit: number;
}
export class PageOffsetDto {
  @ApiProperty({
    nullable: true,
    default: 0,
    required: true,
  })
  offset: number;
}
