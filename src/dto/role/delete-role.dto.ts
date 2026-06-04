import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class DeleteRoleRequestDto {
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class DeleteRoleResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'Role deleted successfully.',
  })
  @IsString()

  message: string;
}
