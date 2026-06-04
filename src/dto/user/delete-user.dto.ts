import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class DeleteUserRequestDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class DeleteUserResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'User deleted successfully.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
