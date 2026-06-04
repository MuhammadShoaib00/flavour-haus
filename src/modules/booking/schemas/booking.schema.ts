import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';
import { SchemaTypes, Types } from 'mongoose';
import { BookingStatus } from '../interfaces/booking-status.enum';
import { FoodItem } from '../interfaces/food-item.interface';
import { Timing } from '../interfaces/timing.interface';

@Schema({
  collection: 'bookings',
  versionKey: false,
  timestamps: true,
})
export class Booking extends AbstractSchema {
  @Prop({
    type: String,
    required: false,
    index: true,
  })
  bookingId?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: false,
  })
  invoiceId?: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
    ref: 'listings',
  })
  listingId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  listingTitle: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
    ref: 'kitchens',
  })
  kitchenId: Types.ObjectId;

  @Prop({
    type: {
      id: SchemaTypes.ObjectId,
      title: String,
      description: String,
    },
    _id: false,
    required: true,
  })
  menu: {
    id: Types.ObjectId;
    title: string;
    description: string;
  };

  @Prop({ type: Array<FoodItem>, required: false })
  foodItems: Array<FoodItem>;

  @Prop({
    type: {
      id: String,
      profileImage: String,
      firstName: String,
      lastName: String,
      email: String,
    },
    _id: false,
    required: false,
  })
  host?: {
    id: string;
    profileImage?: string;
    firstName: string;
    lastName: string;
    email?: string;
  };

  @Prop({
    type: {
      id: String,
      profileImage: String,
      firstName: String,
      lastName: String,
      email: String,
    },
    _id: false,
    required: false,
  })
  guest?: {
    id: string;
    profileImage?: string;
    firstName: string;
    lastName: string;
    email?: string;
  };

  @Prop({
    type: {
      adults: Number,
      children: Number,
      infants: Number,
    },
    required: true,
    _id: false
  })
  noOfGuests: {
    adults: number;
    children: number;
    infants: number;
  };

  @Prop({
    type: {
      date: String,
      timeRange: {
        startTime: String,
        endTime: String,
      },
    },
    required: true,
    _id: false
  })
  selectedTiming: Timing;

  @Prop({ type: String, required: false })
  specialInstructions?: string;

  @Prop({ type: String, required: false })
  rejectionReason?: string;

  @Prop({ type: String, required: false })
  cancellationReason?: string;

  // Payments
  @Prop({ type: Object, required: false, default: {} })
  paymentStatus?: any;

  @Prop({ type: Number, required: true, default: 0 })
  pricePerGuest: number;

  @Prop({ type: Number, required: false, default: 0 })
  totalPrice?: number;

  @Prop({
    type: String,
    required: false,
    default: BookingStatus.NEW,
    enum: BookingStatus,
  })
  bookingStatus?: string;

  @Prop({
    type: {
      guest: Number,
      host: Number
    },
    required: false,
    _id: false
  })
  rating?: {
    guest?: number;
    host?: number
  };

  @Prop({type: Date})
  paidAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
