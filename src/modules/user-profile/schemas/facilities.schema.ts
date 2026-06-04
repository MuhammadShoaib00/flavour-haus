import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
  collection: 'facilities',
  versionKey: false,
  timestamps: true,
})
export class Facility extends AbstractSchema {
  @Prop({ type: String, required: true })
  icon: string;

  @Prop({ type: String, required: true })
  imageName: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String })
  userId: string;
}

export const FacilitySchema = SchemaFactory.createForClass(Facility);
