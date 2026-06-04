import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IFacilitiesSchema extends mongoose.Document {
  icon: string;
  name: string;
  category: string;
  userId: string;
}

export const FacilitiesSchema = new mongoose.Schema<IFacilitiesSchema>(
  {
    icon: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    category: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    userId: {
      type: String,
      default: null,
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
