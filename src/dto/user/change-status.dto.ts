import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ChangeStatusRequestDto {
  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({ examples: [true, false] })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class ChangeStatusResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'User account is activated successfully.',
  })
  @IsString()
  message: string;
}
