import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IRibbonBadgeSchema extends mongoose.Document {
  name: string;
  desc: string;
  type: string;
  icon: string;
}

export const RibbonBadgeSchema = new mongoose.Schema<IRibbonBadgeSchema>(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    desc: {
      type: String,
      required: [true, 'Description can not be empty'],
    },
    icon: {
      type: String,
    },
    type: {
      type: String,
      required: [true, 'Type must be ribbon or badge'],
    },
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
  },
);
