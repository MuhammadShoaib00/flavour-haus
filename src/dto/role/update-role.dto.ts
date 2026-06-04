import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class UpdateRoleRequestDto {
  @ApiPropertyOptional({
    example: 3,
    nullable: true,
  })
  @IsNumber()
  @IsNotEmpty()
  precedence?: number;

  @ApiPropertyOptional({
    example: 'Can create Bookings, Listings ...',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  description?: string;
}

export class UpdateRoleResponseDto extends ApiResponseDto {
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

  @ApiProperty({
    example: 'Role updated successfully.',
  })
  @IsString()
  message: string;
}
