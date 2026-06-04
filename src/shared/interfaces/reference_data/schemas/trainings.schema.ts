import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface ITrainingSchema extends mongoose.Document {
  name: string;
  image: string;
  heading: string;
  content: object;
  url: string;
  is_optional: boolean;
}

export const TrainingSchema = new mongoose.Schema<ITrainingSchema>(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    heading: {
      type: String,
      required: [true, 'Heading can not be empty'],
    },
    image: {
      type: String,
      required: [true, 'Image can not be empty'],
    },
    content: {
      type: Object,
      required: [true, 'Content can not be empty'],
    },
    url: {
      type: String,
      required: [true, 'URL can not be empty'],
    },
    is_optional: {
      type: Boolean,
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
