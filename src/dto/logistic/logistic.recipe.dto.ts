import { ApiProperty } from "@nestjs/swagger";

export class recipeDTO {


  @ApiProperty({
    example: {
      notes: 'street, towm or postCode',
      recipesList:[{
        id:"635feb5cfef183787ec1f4a5",
        name:'taco'
      }]
    },
  })
  recipe: {
    notes: string;
    recipesList:[{
      id:string,
      name:string
    }]
  };

}