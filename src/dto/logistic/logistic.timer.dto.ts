import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class logisticTimerDTO {


  @ApiProperty({example:'Preparation'})
  @IsString()
  progressTracker:string


  @ApiProperty({example:'687'})
  @IsString()
  timerValue:string
}