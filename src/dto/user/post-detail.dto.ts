import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiSingleFile } from '../../shared/decorators/custom';

export class PostUserData {
  @ApiProperty({type: String, required: true, example: "Flavor Haus"})
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({type: String, required: true, example:"Host"})
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({type: String, required: true, example: "+447975777666"})
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({type: Date, required: true, example: "1991-01-01"})
  @IsString()
  @IsNotEmpty()
  dob: Date;

  @ApiProperty({type: String, required: true, example: "male"})
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({type: String, required: true, example: "United Kingdom"})
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({type: String, required: true, example: "London"})
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({type: String, required: true, example: "123 London"})
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: [{ languageName: 'English', proficiencyLevel: 'High' }],
  })
  @ValidateNested({ each: true })
  @Type(() => Language)
  language: Language[];

  @ApiProperty({example: "I offer new meals every week!", type: String})
  @IsString()
  @IsOptional()
  aboutMe: string;
}

class Language {
  @ApiProperty({type: String, required: true})
  @IsNotEmpty()
  languageName: string;

  @ApiProperty({type: String, required: true})
  @IsNotEmpty()
  proficiencyLevel: string;
}

export class ProfileImageDto {
  @ApiSingleFile({ required: false })
  profileImage: any;
}
