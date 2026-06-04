import { SchemaFactory } from '@nestjs/mongoose/dist/factories';
import { Prop, Schema } from '@nestjs/mongoose/dist/decorators';
import { AbstractSchema } from '../shared/classes/abstract.schema';
import { SchemaTypes, Types } from 'mongoose';
@Schema({
  collection: 'wishlists',
  versionKey: false,
})
export class Wishlist extends AbstractSchema {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['Host', 'Listing'], default: 'Listing' })
  category: string;

  @Prop({ type: String, required: false, default: null })
  imageUrl?: string | null;

  @Prop({ type: [String], required: false, default: [] })
  hostIds?: string[];

  @Prop({ type: [SchemaTypes.ObjectId], required: false, default: [] })
  listingIds?: Types.ObjectId[];
}



export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
