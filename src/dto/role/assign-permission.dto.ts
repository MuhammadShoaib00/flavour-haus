import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class AssignPermissionRequestDto {
  @ApiProperty({
    example: 'SYS_ADMIN',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: 'Role.Create',
  })
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}

export class AssignPermissionResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'Role assigned successfully.',
  })
  @IsString()
  message: string;
}
