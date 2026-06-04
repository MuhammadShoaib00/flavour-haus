import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';
import { SchemaTypes, Types } from 'mongoose';
import { InvoiceTypesEnum } from '../interfaces/invoices.enum';

@Schema({
  collection: 'invoices',
  versionKey: false,
  timestamps: true,
})
export class Invoice extends AbstractSchema {
  @Prop({type: String, required: true, index: true})
  invoiceNo: String;

  @Prop({ type: SchemaTypes.ObjectId })
  referenceId?: Types.ObjectId;

  @Prop({ type: String })
  referenceType?: string;

  @Prop({ type: String, required: true, index: true, ref: 'users' })
  userId: string;

  @Prop({ type: String })
  transactionId?: String;

  @Prop({ type: String, required: true, enum: InvoiceTypesEnum })
  type: string;

  @Prop({ type: Number, default: 0.0 })
  amount?: number;

  @Prop({ type: Number, default: 0.0 })
  taxAmount?: number;

  @Prop({ type: Number, default: 0.0 })
  discount?: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  totalAmount: number;

  @Prop({ type: String, required: true, default: "Unpaid" })
  status: string;

  @Prop({ type: Object })
  transactionData?: object;

  @Prop({type: Date})
  paidAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const InvoiceSchema =
  SchemaFactory.createForClass(Invoice);
