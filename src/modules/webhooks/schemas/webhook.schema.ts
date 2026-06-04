import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
  collection: 'webhooks',
  versionKey: false,
  timestamps: true,
})
export class Webhook extends AbstractSchema {
  @Prop({ type: String, required: false, index: false })
  service?: string;

  @Prop({ type: String, required: false })
  type?: string;

  @Prop({ type: Object, required: false })
  data?: object;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
