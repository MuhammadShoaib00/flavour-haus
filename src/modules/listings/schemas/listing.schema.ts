import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({ collection: 'listings', versionKey: false, timestamps: true })
export class Listing extends AbstractSchema {
  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: String, required: true, index: true, ref: 'users' })
  hostId: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
    ref: 'kitchens',
  })
  kitchenId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
  })
  menuId: Types.ObjectId;

  @Prop({ type: Array<FoodItems>, required: true })
  foodItems: Array<FoodItems>;

  @Prop({ type: Number, required: true })
  noOfGuests: number;

  @Prop({ type: [String], default: [], required: false })
  houseRules?: string[];

  @Prop({ type: Boolean, required: false })
  sharedDinning?: boolean;

  @Prop({ type: Boolean, required: false })
  isChildrenAllowed?: boolean;

  @Prop({ type: Number, required: true, default: 0 })
  price: number;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: Array<Timings>, required: true })
  timings: Array<Timings>;

  @Prop({ type: Boolean, required: false, default: false })
  isListed?: boolean;

  @Prop({ type: Boolean, required: false })
  isFeatured?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export interface FoodItems {
  itemId: string;
  itemName: string;
}

export interface Timings {
  startDate: string;
  endDate: string;
  timeRanges: [
    {
      startTime: string;
      endTime: string;
      startTimeSearch: Date;
      endTimeSearch: Date;
    },
  ];
  startDateSearch: Date;
  endDateSearch: Date
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
