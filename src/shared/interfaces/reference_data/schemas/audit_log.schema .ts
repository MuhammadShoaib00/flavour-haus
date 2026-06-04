import * as mongoose from 'mongoose';
import { transformValue } from './schemas';

export interface IAuditLogSchema extends mongoose.Document {
  name: string;
  userId: string;
  role: string;
  status: string;
  ipAddress: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
}

export const AuditLogSchema = new mongoose.Schema<IAuditLogSchema>(
  {
    name: {
      type: String,
    },
    userId: {
      type: String,
    },
    role: {
      type: String,
    },
    status: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    eventName: {
      type: String,
    },
    eventDate: {
      type: String,
    },
    eventTime: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
