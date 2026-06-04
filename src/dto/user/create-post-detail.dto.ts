import { ApiProperty } from '@nestjs/swagger';
import { UserAuditStatusEnum } from '../../shared/interfaces/user_audits/user-audit.enum';

export class PostDetailResponseDto {
  @ApiProperty({
    nullable: true,
  })
  errors: string | object | null;
  @ApiProperty({
    nullable: true,
  })
  message: string;
  @ApiProperty({
    nullable: true,
    example: {'...user_details': '...user_details'}
  })
  data: any;
}

export class getLicenseDetailResponseDto {
  @ApiProperty({
    nullable: true,
  })
  errors: string | object | null;
  @ApiProperty({
    nullable: true,
  })
  message: string;
  @ApiProperty({
    nullable: true,
    example: {
      "_id": "cb59cbdf-------9911b4c1",
      "contractBookData": {
        "id": "117a----bdcd698f79d3",
        "title": "Flavor Haus Host Agreement",
        "status": "pending",
        "data": {},
        "createdAt": "2022-11-25T11:10:57.346+00:00",
        "updatedAt": "2022-11-25T11:10:57.346+00:00"
      },
      "license": {
        "haveUTRNumber": false,
        "UTRNumber": "1234567890",
        "havePremisesPermission": true,
        "premisesPermissionFile": "data:image/png;base64,iVBORw0KGg...........oAAA"
      }
    },
  })
  data: any;
}
