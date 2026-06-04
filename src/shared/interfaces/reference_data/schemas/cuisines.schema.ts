import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface ICuisineSchema extends mongoose.Document {
  name: string;
  category: string;
}

export const CuisineSchema = new mongoose.Schema<ICuisineSchema>(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    category: {
      type: String,
      required: [true, 'Category can not be empty'],
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
