import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetUserCountResponse extends ApiResponseDto {
    @ApiProperty({
        example: {
            "users": {
                "totaluser": 0,
                "Active": 0,
                "inActive": 1
              },
              "recentActivity": {
                "auditlogs": [
                  {
                    "_id": "6377bc74012d4bdb2e322af5",
                    "name": "Super Admin",
                    "userId": "8df4e548-0eb1-431e-a39a-ce7cc0cb8987",
                    "role": "SYS_ADMIN",
                    "status": "ACTIVE",
                    "ipAddress": "::1",
                    "eventName": "AdminDashboard.GetUserCountbyStatus",
                    "eventDate": "18/11/2022",
                    "eventTime": "22:10:12",
                    "createdAt": "2022-11-18T17:10:12.817Z",
                    "updatedAt": "2022-11-18T17:10:12.817Z",
                    "__v": 0
                  }
                ]
            }
        }
    })
    data: Array<any>;
    @ApiProperty({
        example: "All Users",
    })
    message: string;
}

export class GetRecentActivtyResponse extends ApiResponseDto {
    @ApiProperty({
        example: []
    })
    data: Array<any>;
    @ApiProperty({
        example: "All Users",
    })
    message: string;
}



