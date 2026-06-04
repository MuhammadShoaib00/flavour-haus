import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({ versionKey: false })
export class Permission extends AbstractSchema {
  @Prop({ type: String, required: true, index: true, unique: true })
  permissionId: string;

  @Prop({ type: String, required: true })
  apiUrl: string;

  @Prop({
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  apiMethod: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: [String], default: [] })
  allowedRoles?: string[];

  @Prop({ type: [String], required: false, default: [] })
  dependencies?: string[];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
