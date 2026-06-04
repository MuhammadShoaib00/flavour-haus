import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { AbstractSchema } from "../shared/class/abstract.schema";

@Schema({ versionKey: false, timestamps: true })
export class Menu extends AbstractSchema {
  @Prop({ type: String, required: true, index: true })
  category: string;

  @Prop({ type: String, required: true, })
  description: string;

  @Prop({ type: String, required: true, index: true, ref: 'users' })
  hostId: string;

  @Prop({ type: Object, required: false })
  menuImages: [{
    id: string
    url: string
  }];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'fooditems', required: false })
  foodItems: [string];

  @Prop({ type: Boolean, required: false, default: false })
  isPublished?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
