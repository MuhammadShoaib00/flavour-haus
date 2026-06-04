import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetRoleResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      role: 'HOST',
      precedence: 3,
      description: 'Can create Bookings, Listings...',
      createdAt: '2015-01-01T00:00:00',
      updatedAt: '2015-01-01T00:00:00',
    },
  })
  @IsObject()
  data: {
    role: string;
    precedence: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}
