import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  maxLength,
  ValidateNested,
} from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import {
  UserAuditStatusEnum,
  UserAuditTypeEnum,
} from '../../shared/interfaces/user_audits/user-audit.enum';

export class GetUsersForAuditResponseDto extends ApiResponseDto {
  @ApiProperty({
    example: {
      audits: [
        {
          _id: '638xxxxxx9f',
          kitchenId: '638xxxxxx9f',
          auditorId: '638xxxxxx9f',
          hostId: '638xxxxxx9f',
          auditType: 'Announced Visit',
          status: 'Pending',
          confirmed: false,
          createdAt: 'Date',
          updatedAt: 'Date',
          kitchen: {
            _id: '638xxxxxx9f',
            name: 'Kitchen Name',
          },
          host: {
            _id: '638xxxxxx9f',
            firstName: 'agagga',
            lastName: 'khan',
            language: [
              {
                languageName: 'Xhosa',
                proficiencyLevel: 'Expert',
              },
            ],
            address: 'rfgrfgfdg',
            city: 'Alāqahdārī Dīshū',
            gender: 'Female',
            profileImage: null,
          },
        },
      ],
    },
  })
  data: any;

  @ApiProperty({ example: 'Host(s) Eligible for audit' })
  message: string;
}

export class AssignUsersForAuditRequest {
  @ApiProperty({
    example: ['6388d6e75f70189fa5ddb5b3'],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @Prop({ type: [String], required: true })
  auditIds: string[];

  @ApiProperty({
    example: 'acff92d2-4972-4164-b928-f78b30789199',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  auditorId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @ApiProperty({
    type: Date,
    example: '2022-12-05T19:00:00.000Z',
    required: true,
  })
  dueDate: Date;
}

export class AssignUsersForAddtionalAuditRequest extends AssignUsersForAuditRequest {
  @ApiProperty({
    example: UserAuditTypeEnum.ANNOUNCED_VISIT,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(UserAuditTypeEnum))
  @Prop({ type: String, required: true })
  auditType: string;
}

class AuditHost {
  @ApiProperty()
  @IsNotEmpty()
  hostId: string;

  @ApiProperty()
  @IsNotEmpty()
  kitchenId: Types.ObjectId;
}

export class AssignUsersForAuditResponse extends ApiResponseDto {
  @ApiProperty({ example: 'Host(s) assigned for audit to compliance officer' })
  message: string;
}

export class UserAuditChangeStatusDto {
  @ApiProperty({
    example: '638a12f8ef2edd1c2fc3a934',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  auditId: string;

  @ApiProperty({
    example: UserAuditStatusEnum.IN_PROGRESS,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(UserAuditStatusEnum))
  @Prop({ type: String, required: true })
  status: UserAuditStatusEnum;

  @ApiProperty({
    example: 'Host is alright',
    required: true,
  })
  @IsString()
  @IsOptional()
  @Prop({ type: String, required: true })
  message: string;

  @ApiProperty({
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsOptional()
  @Prop({ type: Boolean, required: true })
  isHostConfirmed: boolean;
}

export class UserAuditChangeStatusResponse extends ApiResponseDto {
  @ApiProperty({ example: 'Status for audit has been changed' })
  message: string;
}
