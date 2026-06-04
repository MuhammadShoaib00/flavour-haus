import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ListRolesResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: [
      {
        role: 'HOST',
        precedence: 3,
        description: 'Can create Bookings, Listings...',
        createdAt: '2015-01-01T00:00:00',
        updatedAt: '2015-01-01T00:00:00',
      },
    ],
  })
  @IsArray()
  data: [
    {
      role: string;
      precedence: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    },
  ];
}
