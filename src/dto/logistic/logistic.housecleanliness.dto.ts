import { ApiProperty } from "@nestjs/swagger"

export class houseCleanlinessDTO{

  @ApiProperty({
  example : {
    floorCounterCookingSurfaceDisinfectant:true,
    cookingAndCutleryCleanup:true,
    crossContamination:true,
    wasterDisposal:true,
    postCookingCleanup:true
  }
  })
  houseCleanlinessKitchen?:{
    floorCounterCookingSurfaceDisinfectant:boolean,
    cookingAndCutleryCleanup:boolean,
    crossContamination:boolean,
    wasterDisposal:boolean,
    postCookingCleanup:boolean
  }


  @ApiProperty({
  example:{
    diningTableCleanup:true,
    floorCleanup:true,
    overallCleanup:true,
    sittingArrangement:true
  }
  })
  houseCleanlinessDiningArea?:{
    diningTableCleanup:boolean,
    floorCleanup:boolean,
    overallCleanup:boolean,
    sittingArrangement:boolean
  }


  @ApiProperty({
  example:{
    floorSurfaceCleanup:true,
    overallDecorationAndArrangement:true
  }
  })
  houseCleanlinessOtherAreas?:{
    floorSurfaceCleanup:boolean,
    overallDecorationAndArrangement:boolean
  }

  @ApiProperty({
  example:{
    bathroomSinkToiletCleanup:true,
    freshSoapHandwashPlaced:true,
    newTowelPlaced:true,
    toiletPaperPlaced:true
  }
  })
  houseCleanlinessBathroomToilet?:{
    bathroomSinkToiletCleanup:boolean,
    freshSoapHandwashPlaced:boolean,
    newTowelPlaced:boolean,
    toiletPaperPlaced:boolean
  }





}