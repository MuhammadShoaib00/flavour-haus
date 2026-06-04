import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface ICitySchema extends mongoose.Document {
  city_name: string;
  country: string;
  country_code: string;
  country_code_2: string;
}

export const CitySchema = new mongoose.Schema<ICitySchema>(
  {
    city_name: {
      type: String,
      required: [true, 'City Name can not be empty'],
    },
    country: {
      type: String,
      required: [true, 'Category can not be empty'],
    },
    country_code: {
      type: String,
      required: [true, 'Country Code can not be empty'],
    },
    country_code_2: {
      type: String,
      required: [true, 'Country Code 2 can not be empty'],
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
