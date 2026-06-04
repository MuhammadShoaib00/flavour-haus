import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from "../shared/class/abstract.schema";

@Schema({
    versionKey: false,
    timestamps: true,
})



export class Food extends AbstractSchema {
    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'menus' })
    menuId: Types.ObjectId;
    @Prop({ type: String })
    cuisine: string
    @Prop({ type: [String] })
    allergen: string[]
    @Prop({ type: String })
    available: string
    @Prop({ type: String })
    ageRestriction: string
    @Prop({ type: String })
    recipe: string
    @Prop({ type: String })
    spice: string
    @Prop({ type: String })
    itemCategory: string
    @Prop({ type: [String] })
    ingredient: string[]
    @Prop({ type: String })
    dietary: string
    @Prop({ type: String })
    description: string
    @Prop({ type: String })
    itemName: string

    @Prop({ type: String, required: false, ref: 'ribbons_badges' })
    badgeId:string

    @Prop({ type: Object, required: false })
    foodImages: [{
        id: string
        url: string
    }];
    @Prop({type:Number,required:false,default:0})
    orderedCount:number

    @Prop({type: Object, default: {
        calories: {value: 0, unit: "kcal"},
        total_fat: {value: 0, unit: "g"},
        saturated_fat: {value: 0, unit: "g"},
        cholesterol: {value: 0, unit: "mg"},
        sodium: {value: 0, unit: "mg"},
        total_carbohydrate: {value: 0, unit: "g"},
        dietary_fiber: {value: 0, unit: "g"},
        sugars: {value: 0, unit: "g"},
        protein: {value: 0, unit: "g"},
        potassium: {value: 0, unit: "mg"},
    }})
    nutritions: {
        calories: {value: number, unit: string};
        total_fat: {value: number, unit: string};
        saturated_fat: {value: number, unit: string};
        cholesterol: {value: number, unit: string};
        sodium: {value: number, unit: string};
        total_carbohydrate: {value: number, unit: string};
        dietary_fiber: {value: number, unit: string};
        sugars: {value: number, unit: string};
        protein: {value: number, unit: string};
        potassium: {value: number, unit: string};
    };
}

export const FoodSchema = SchemaFactory.createForClass(Food);
