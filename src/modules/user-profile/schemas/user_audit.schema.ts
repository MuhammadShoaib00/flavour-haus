import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import {
  UserAuditStatusEnum,
  UserAuditTypeEnum,
} from '../interfaces/user-audit.enum';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'user_audits',
})
export class UserAudit extends AbstractSchema {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
    ref: 'kitchens',
  })
  kitchenId: Types.ObjectId;

  @Prop({ type: String, required: false, default: '' })
  kitchenName: string;

  @Prop({
    type: String,
    required: true,
    index: true,
    ref: 'users',
  })
  hostId: string;

  @Prop({ type: String, required: true, index: true })
  hostName: string;

  @Prop({ type: String, required: false, default: null })
  hostProfileImage: string;

  @Prop({
    type: {
      address: String,
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    required: true,
    _id: false,
  })
  location: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };

  @Prop({
    type: Object,
    required: false,
    index: true,
    // default: null,
  })
  loc?: {
    type: string;
    coordinates: number[];
  };

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  auditorId?: string;

  @Prop({ type: String, required: false, default: null })
  auditorName?: string;

  @Prop({
    type: String,
    required: false,
    index: true,
    default: null,
  })
  auditType?: UserAuditTypeEnum | null;

  @Prop({
    type: String,
    required: false,
    default: UserAuditStatusEnum.UNASSIGNED,
  })
  status?: UserAuditStatusEnum;

  @Prop({ type: Boolean, required: false, default: false })
  confirmed?: boolean;

  @Prop({ type: Date, required: false, default: null })
  dueDate?: Date | null;

  @Prop({ type: Date, required: false })
  completedAt?: Date;

  @Prop({ type: Array<{ status: string; date: Date }>, required: false })
  timeLine?: Array<{ status: string; date: Date }>;

  @Prop({ type: String, required: false })
  message?: string;
}

export const UserAuditSchema = SchemaFactory.createForClass(UserAudit);
