import { ApiProperty } from "@nestjs/swagger";

export class menuDTO {

  @ApiProperty({ example:{ notes:'any notes' }})
  menu: string;

}