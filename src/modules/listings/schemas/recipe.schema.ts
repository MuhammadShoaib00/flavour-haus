import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({ collection: 'recipes', versionKey: false, timestamps: true })
export class Recipe extends AbstractSchema {
  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: String, required: true, index: true, ref: 'users' })
  hostId: string;

  @Prop({type: String, required: true, index: true})
  description: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  main_ingredient: string;

  @Prop({ type: String, required: true })
  cuisine: string;

  @Prop({ type: Array<{ name: string, unit: string, qty: number, icon: string }>, required: true })
  ingredients: Array<{ name: string, unit: string, qty: number, icon: string }>;

  @Prop({ type: Array<string>, required: false })
  images?: Array<string>;

  @Prop({ type: Number, required: true})
  servings: number;

  @Prop({ type: {hours: Number, mins: Number}, required: true })
  cookingTime: {hours: number, mins: number};

  @Prop({ type: String, required: true })
  cookingInstructions: string; 

  @Prop({ type: Object, required: false })
  nutritions?: any;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
