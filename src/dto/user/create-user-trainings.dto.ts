import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class CreateUserTrainingDto {
  @ApiProperty({ example: '634d7de53a0a1b59d2b82cd5' })
  @IsNotEmpty()
  @IsString()
  trainingId: string;
}

export class CreateUserTrainingResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'User Training has been successfully marked as completed' })
  message: 'User Training has been successfully marked as completed';
}
