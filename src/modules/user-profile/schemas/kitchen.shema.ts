import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

const daysInWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

@Schema({
  collection: 'kitchens',
  versionKey: false,
  virtuals: true,
  toObject: {
    transform(doc, ret, options) {
      let days = {};
      ret.servingDays.split('').forEach((bool: number, i: number) => {
        days[daysInWeek.at(i)] = bool == 1;
      });
      ret.servingDays = days;
      return ret;
    },
  },
  toJSON: {
    transform(doc, ret, options) {
      let days = {};
      ret.servingDays.split('').forEach((bool: number, i: number) => {
        days[daysInWeek.at(i)] = bool == 1;
      });
      ret.servingDays = days;
      return ret;
    },
  },
})
export class Kitchen extends AbstractSchema {
  @Prop({
    type: String,
    unique: true,
    index: true,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: false,
  })
  userName?: string;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  userRating?: number;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: Array, required: false })
  coverPhotos?: {
    id: string;
    url: string;
  }[];

  @Prop({
    type: String,
    required: false,
  })
  selectedCoverPhoto?: string;

  @Prop({
    type: Object,
    required: false,
  })
  location?: {
    address?: string;
    longitude?: number;
    latitude?: number;
  };

  @Prop({ type: String, maxlength: 7, required: false, default: '0000000' })
  servingDays?: string;

  @Prop({ type: String, required: false })
  servingTimeFrom?: string;

  @Prop({ type: String, required: false })
  servingTimeTo?: string;

  @Prop({
    type: Object,
    required: false,
    default: {
      foodRestrictionApplied: false,
      restrictedFoods: [],
      smokingRestrictionApplied: false,
      dressCodeRestrictionApplied: false,
      dressCodeRestriction: '',
      petsRestrictionApplied: false,
    },
  })
  houseRules?: {
    foodRestrictionApplied?: boolean;
    restrictedFoods?: string[];
    smokingRestrictionApplied?: boolean;
    dressCodeRestrictionApplied?: boolean;
    dressCodeRestriction?: string;
    petsRestrictionApplied?: boolean;
  };

  @Prop({ type: Object, required: false })
  myFacilities?: {
    numberOfGuest: number;
    icons: [
      {
        icon: string;
      },
    ];
  };

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: 'ribbons_badges',
    required: false,
  })
  badgesId?: [string];

  @Prop({
    type: [String],
    required: false,
  })
  language?: [string];

  @Prop({
    type: Object,
    required: false,
  })
  boostedDates:{
    startDate:string,
    endDate:string
  }
}

export const KitchenSchema = SchemaFactory.createForClass(Kitchen);
