import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class AllBackupsDto extends ApiResponseDto {
  @ApiProperty({
    example: {
    backups: [
        {
            _id: "63a32455ba0798339282a853",
            file: "backups/2022_12_21.zip",
            type: "database",
            status: "Success",
            createdAt: "2022-12-21T15:20:53.114Z",
            updatedAt: "2022-12-21T15:20:54.036Z"
        },
      ],
      meta: {
        page: 1,
        pages: 1,
        limit: 100,
        total: 1,
      },
    },
  })
  data: any;

  @ApiProperty({ example: 'All Backups' })
  message: string;
}

export class DeletingBackupsRequest {
    @ApiProperty({
        example: ['63a3244cba0798339282a833'],
        required: true,
    })
    @Prop({ type: Array<Types.ObjectId>, required: true })
    @IsArray()
    backupIds: Array<Types.ObjectId>;
}