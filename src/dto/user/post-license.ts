import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  isNumberString,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiSingleFile } from '../../shared/decorators/custom';

export class PostLicenseData {
  @ApiProperty({
    example: true,
    required: true,
  })
  @IsNotEmpty()
  haveUTRNumber: boolean;

  @ApiProperty({
    example: '34568 12397',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/\d{5} \d{5}/, { message: 'Not a valid UTR Number.' })
  @MaxLength(11, { message: 'Not a valid UTR Number.' })
  UTRNumber?: string;

  @ApiProperty({
    example: true,
    required: true,
  })
  @IsNotEmpty()
  havePremisesPermission: boolean;

  @ApiProperty({ required: true })
  @ApiSingleFile({ required: true })
  premisesPermissionFile: any;
}
