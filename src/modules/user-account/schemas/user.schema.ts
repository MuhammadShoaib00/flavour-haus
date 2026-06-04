import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', versionKey: false, timestamps: true })
export class User extends AbstractSchema<string> {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: false })
  password?: string;

  @Prop({ type: String, required: false })
  firstName?: string;

  @Prop({ type: String, required: false })
  lastName?: string;

  @Prop({ type: String, required: false })
  phoneNumber?: string;

  @Prop({ type: String, required: false })
  preferredUsername?: string;

  @Prop({ type: String, required: false, default: 'GUEST', enum: ['SYS_ADMIN', 'CMP_OFFICER', 'HOST', 'GUEST'] })
  defaultRole?: string;

  @Prop({ type: Boolean, required: false, default: true })
  isActive?: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  isEmailVerified?: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  isHostConfirmed?: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  isAssignedForAudit?: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  isEligibleForAudit?: boolean;

  @Prop({ type: String, required: false })
  refreshToken?: string;

  @Prop({ type: String, required: false })
  resetToken?: string;

  @Prop({ type: String, required: false })
  verificationCode?: string;

  @Prop({ type: String, required: false })
  profileImage?: string;

  @Prop({ type: Date, required: false })
  dob?: Date;

  @Prop({ type: String, required: false })
  gender?: string;

  @Prop({ type: String, required: false })
  aboutMe?: string;

  @Prop({ type: String, required: false })
  country?: string;

  @Prop({ type: String, required: false })
  city?: string;

  @Prop({ type: String, required: false })
  address?: string;

  @Prop({ required: false })
  language?: [
    {
      languageName: string;
      proficiencyLevel: string;
    },
  ];

  @Prop({ type: Object, required: false })
  profileCompletion?: {
    personalInfo: { required: boolean; percentage: number; completed: boolean };
    licenses: { required: boolean; percentage: number; completed: boolean };
    idVerification: { required: boolean; percentage: number; completed: boolean };
    kitchenDetails: { required: boolean; percentage: number; completed: boolean };
    trainings: { required: boolean; percentage: number; completed: boolean };
    ribbons: { required: boolean; percentage: number; completed: boolean };
    badges: { required: boolean; percentage: number; completed: boolean };
    facilities: { required: boolean; percentage: number; completed: boolean };
    houseRules: { required: boolean; percentage: number; completed: boolean };
  };

  @Prop({ type: Number, required: false, default: 10 })
  overalProfileCompletion?: number;

  @Prop({
    type: Object,
    required: false,
    default: {
      status: true,
      file: null,
    },
  })
  dbsCheck?: {
    status?: boolean;
    file?: string;
  };

  @Prop({ type: Object, required: false })
  contractBookData?: {
    id: string;
    title: string;
    status: string;
    data: object | any;
    createdAt: Date;
    updatedAt: Date;
  };

  @Prop({ type: Object, required: false })
  license?: {
    haveUTRNumber: boolean;
    UTRNumber: string;
    havePremisesPermission: boolean;
    premisesPermissionFile: string;
  };

  @Prop({ type: [Object], required: false })
  userPermissions?: [
    {
      permissionGroup: string;
      permissions: {
        list: { allowed: boolean };
        update: { allowed: boolean };
        delete: { allowed: boolean };
      };
    },
  ];

  @Prop({ type: Number, required: false })
  avgRating?: number;

  @Prop({ type: Number, required: false })
  totalReview?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
