import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({ collection: 'ingredients', versionKey: false, timestamps: true })
export class Ingredient extends AbstractSchema {
  @Prop({ type: String, required: false, index: true, ref: 'users' })
  hostId?: string;

  @Prop({ type: String, required: true, index: true })
  name: string;

  // @Prop({ type: String, required: true })
  // unit: string;

  @Prop({ type: String, required: false })
  icon?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
