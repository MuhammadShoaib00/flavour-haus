import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class SignContractRequestDto {
  @ApiProperty({ example: "host@yopmail.com", required: true })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class SignContractResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Contract has been sent to your email. Please sign the contract, it will be updated automatically, you can leave this page safely.' })
 @IsString()
  message: string;
}
