import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { AbstractSchema } from "../shared/classes/abstract.schema";

@Schema({ versionKey: false, timestamps: true })
export class Logistic extends AbstractSchema {

  @Prop({
    type: Object,
    required: false
  })
  menu?: {
    notes?: string
  }

  @Prop({
    type: Object,
    required: false
  })
  recipe?: {
    notes: string;
    recipesList: [{
      id: string,
      name: string
    }]
  }

  @Prop({
    type: Object,
    required: false
  })
  shoppingList?: {
    ingredientList: [{
      id: string,
      name: string
      qty: string
    }],
    notes: string;
  }

  @Prop({
    type: Boolean,
    required: false
  })
  houseRules?: boolean

  @Prop({
    type: Boolean,
    required: false
  })
  facilities?: boolean


  @Prop({
    type: Object,
    required: false
  })
  houseCleanlinessKitchen?: {
    floorCounterCookingSurfaceDisinfectant: boolean,
    cookingAndCutleryCleanup: boolean,
    crossContamination: boolean,
    wasterDisposal: boolean,
    postCookingCleanup: boolean
  }

  @Prop({
    type: Object,
    required: false
  })
  houseCleanlinessDiningArea?: {
    diningTableCleanup: boolean,
    floorCleanup: boolean,
    overallCleanup: boolean,
    sittingArrangement: boolean
  }

  @Prop({
    type: Object,
    required: false
  })
  houseCleanlinessOtherAreas?: {
    floorSurfaceCleanup: boolean,
    overallDecorationAndArrangement: boolean
  }

  @Prop({
    type: Object,
    required: false
  })
  houseCleanlinessBathroomToilet?: {
    bathroomSinkToiletCleanup: boolean,
    freshSoapHandwashPlaced: boolean,
    newTowelPlaced: boolean,
    toiletPaperPlaced: boolean
  }


  @Prop({ type: String })
  completePercentage: string


  @Prop({ type: String })
  progressTracker: string

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ required: false })
  timerValue: string

  @Prop({ type: SchemaTypes.ObjectId, ref: 'bookings', required: true })
  bookingId: string

  @Prop({ type: String, required: false, index: true })
  bookingNo?: string;
}

export const LogisticSchema = SchemaFactory.createForClass(Logistic);
