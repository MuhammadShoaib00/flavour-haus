import { SchemaFactory } from '@nestjs/mongoose/dist/factories';
import { Prop, Schema } from '@nestjs/mongoose/dist/decorators';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../shared/classes/abstract.schema';

@Schema({
    versionKey: false,
    timestamps: true,
})

export class Review extends AbstractSchema {
    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'bookings' })
    bookingId: Types.ObjectId;
    
    @Prop({ type: String, required: true, ref: 'users' })
    hostId: string;

    @Prop({ type: String, required: true, ref: 'users' })
    guestId: string;

    @Prop({ type: String, required: true })
    listingName: string;

    @Prop({
        type: {
            name: String,
            profileImage: String,
            review: String,
            rating: Number
        }
        , _id: false, required: false
    })
    host?: {
        name?: string;
        profileImage?: string;
        review?: string;
        rating?: number;
    };

    @Prop({
        type: {
            name: String,
            profileImage: String,
            review: String,
            rating: Number,
            experience: {
                diningSpace: Number,
                hygineLevel: Number,
                portaion: Number,
                taste: Number,
                foodQuality: Number,
                professionalism: Number,
                timeliness: Number,
                reasonableAdjustment: Number
            }
        }, required: false, _id: false
    })
    guest?: {
        name?: string;
        profileImage?: string;
        review?: string;
        rating?: number;
        experience?: {
            diningSpace?: number
            hygineLevel?: number
            portaion?: number
            taste?: number
            foodQuality?: number
            professionalism?: number
            timeliness?: number
            reasonableAdjustment?: number
        };
    };

}



export const ReviewSchema = SchemaFactory.createForClass(Review);
