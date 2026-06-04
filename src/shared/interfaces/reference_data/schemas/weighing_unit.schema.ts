import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IWeighingSchema extends mongoose.Document {
    name: string;
    unit: string;
    type: string;
}

export const WeighingSchema = new mongoose.Schema<IWeighingSchema>(
    {
        name: {
            type: String,
            required: [true, 'Name can not be empty'],
        },
        unit: {
            type: String,
            required: [true, 'Unit can not be empty'],
        },
        type: {
            type: String,
            required: [true, 'Unit Type can not be empty'],
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
