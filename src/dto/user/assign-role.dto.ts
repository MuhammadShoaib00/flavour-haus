import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class AssignRoleRequestDto {
  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({ example: 'HOST' })
  @IsNotEmpty()
  @IsString()
  role: string;
}

export class AssignRoleResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Role assigned successfully.' })
  @IsNotEmpty()
  message: string;
}
