import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
  collection: 'user_trainings',
  versionKey: false,
  timestamps: true,
})
export class UserTraining extends AbstractSchema {
  @Prop({ type: String, required: true, ref: 'users' })
  userId: string;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'trainings' })
  trainingId: Types.ObjectId;

  @Prop({ type: Date, required: false })
  completedAt: Date;
}

export const UserTrainingsScehma = SchemaFactory.createForClass(UserTraining);
