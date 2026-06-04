import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { IUser } from '../../shared/interfaces/user';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ListUsersRequestDto {}

export class ListUsersResponseDto extends ApiResponseDto {
  @ApiProperty({
    example:{
      users: [{
        _id: "9d40xxxxxxxxxxfe5",
        firstName: "firstName",
        lastName: "lastName",
        email: "email",
        phoneNumber: "phoneNumber",
        language: [],
        defaultRole: "defaultRole",
        isActive: false,
        isHostConfirmed: false,
        overalProfileCompletion: 10,
        createdAt: "2022-12-20T11:56:30.652Z",
        updatedAt: "2022-12-20T11:58:02.029Z"
      }],
      meta: {
        page: 1,
        pages: 2,
        limit: 10,
        total: 17
      }
    }
  })
  @IsArray()
  data: IUser[];
}
