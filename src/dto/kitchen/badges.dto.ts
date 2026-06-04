import {ApiProperty} from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AddBadgesDTO {
    @ApiProperty({ example: ['xxxx-xxxx-xxxxxxx-xxxxx'] })
    @IsNotEmpty()
    badgesId:[]
}
