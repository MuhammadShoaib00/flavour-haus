import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
    versionKey: false,
    timestamps: true,
})
export class AuditLog extends AbstractSchema {
    @Prop({ type: String, required: false })
    name: string

    @Prop({ type: String, required: false })
    userId: string

    @Prop({ type: String, required: false })
    role: string

    @Prop({ type: String, required: false })
    status: string

    @Prop({ type: String, required: false })
    ipAddress: string

    @Prop({ type: String, required: false })
    eventName: string

    @Prop({ type: String, required: false })
    eventTime: string

    @Prop({ type: String, required: false })
    eventDate: string

}


export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
