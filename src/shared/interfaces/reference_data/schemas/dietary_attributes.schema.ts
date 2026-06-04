import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IDietaryAttributeSchema extends mongoose.Document {
  name: string;
  desc: string;
}

export const DietaryAttributeSchema =
  new mongoose.Schema<IDietaryAttributeSchema>(
    {
      name: {
        type: String,
        required: [true, 'Name can not be empty'],
      },
      desc: {
        type: String,
        required: [true, 'Descripiton can not be empty'],
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
