import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
  collection: 'food_ingredients',
  versionKey: false,
})
export class FoodIngredient {
  @Prop({
    type: String,
    required: false,
  })
  _id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  imageUrl: string;

  @Prop({
    type: String,
    index: true,
    required: false,
    default: null,
  })
  userId?: string;
}

export const FoodIngredientSchema =
  SchemaFactory.createForClass(FoodIngredient);
