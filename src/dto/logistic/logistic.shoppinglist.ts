import { ApiProperty } from "@nestjs/swagger";

export class shoppingListDTO {


  @ApiProperty({
    example: {
      notes: 'street, towm or postCode',
      recipesList:[{
        id:"635feb5cfef183787ec1f4a5",
        name:'taco',
        qty:'1'
      }]
    },
  })
  shoppingList: {
    notes: string;
    ingredientList:[{
      id:string,
      name:string,
      qty:string
    }]
  };

}