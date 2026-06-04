import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class RemovePermissionRequestDto {
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

export class RemovePermissionResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: 'Role removed successfully.',
  })
  @IsString()
  
  message: string;
}
