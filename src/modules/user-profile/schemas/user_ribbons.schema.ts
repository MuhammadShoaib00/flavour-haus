import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
  collection: 'user_ribbons',
  versionKey: false,
  timestamps: true,
})
export class UserRibbons extends AbstractSchema {
  @Prop({ type: String, required: true, ref: 'users', select: false })
  userId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, ref: 'ribbons_badges' })
  ribbonImage: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  offer: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;
}

export const RibbonsSchema = SchemaFactory.createForClass(UserRibbons);
