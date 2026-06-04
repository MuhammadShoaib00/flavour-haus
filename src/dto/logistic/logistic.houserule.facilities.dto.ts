import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class houseRulesOrFacilitiesDTO {


  @IsOptional()
  @IsBoolean()
  @ApiProperty({
   example:false
  })
  houseRules:boolean

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
   example:true
  })
  facilities:boolean
}
