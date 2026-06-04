import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({ versionKey: false, collection: "rights" })
export class Right extends AbstractSchema {
  @Prop({ type: String, required: true, index: true })
  permissionName: string;

  @Prop({ type: String, required: true})
  permissionGroup: string;
  
  @Prop({ type: Object, required: true})
  permissions: any;
  
  @Prop({ type: [String], required: true, index: true })
  permissionMethods?: [string] | [] | null;
}

export const RightSchema = SchemaFactory.createForClass(Right);
