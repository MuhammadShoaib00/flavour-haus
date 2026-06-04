import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IAllergySchema extends mongoose.Document {
  name: string;
  desc: string;
  icon: string;
}

export const AllergySchema = new mongoose.Schema<IAllergySchema>(
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
