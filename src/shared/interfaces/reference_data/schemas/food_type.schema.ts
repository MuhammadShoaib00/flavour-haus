import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IFoodTypeSchema extends mongoose.Document {
  name: string;
}

export const FoodTypeSchema = new mongoose.Schema<IFoodTypeSchema>(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
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
