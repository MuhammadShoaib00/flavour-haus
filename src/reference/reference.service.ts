import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAllergySchema } from '../shared/interfaces/reference_data/schemas/allergens.schema';
import { ICitySchema } from '../shared/interfaces/reference_data/schemas/cities.schema';
import { ICuisineSchema } from '../shared/interfaces/reference_data/schemas/cuisines.schema';
import { IDietaryAttributeSchema } from '../shared/interfaces/reference_data/schemas/dietary_attributes.schema';
import { IRibbonBadgeSchema } from '../shared/interfaces/reference_data/schemas/ribbons_badges.schema';
import { IFacilitiesSchema } from '../shared/interfaces/reference_data/schemas/facilities.schema';
import { BookingStatus } from '../shared/interfaces/booking/booking-status.enum';
import {
  UserAuditStatusEnum,
  UserAuditStatusEnumForDto,
  UserAuditTypeEnum,
} from '../shared/interfaces/user_audits/user-audit.enum';
import { IWeighingSchema } from '../shared/interfaces/reference_data/schemas/weighing_unit.schema';
export class ReferenceService {
  constructor(
    // @InjectModel('Food_types')
    // private readonly foodtypeModel: Model<IFoodTypeSchema>,
    // @InjectModel('Trainings')
    // private readonly trainingModel: Model<ITrainingSchema>,
    @InjectModel('Cuisines')
    private readonly cuisineModel: Model<ICuisineSchema>,
    @InjectModel('Allergens')
    private readonly allergyModel: Model<IAllergySchema>,
    @InjectModel('Ribbons_badges')
    private readonly ribbonBadgeModel: Model<IRibbonBadgeSchema>,
    @InjectModel('Dietary_attributes')
    private readonly dietaryModel: Model<IDietaryAttributeSchema>,
    @InjectModel('Cities')
    private readonly cityModel: Model<ICitySchema>,
    @InjectModel('Facilities')
    private readonly facilitiesModel: Model<IFacilitiesSchema>,
    @InjectModel('Weighing_units')
    private readonly unitsModel: Model<IWeighingSchema>,
  ) {}
  public async get_reference_data(): Promise<any> {
    const ribbons_badges = await this.ribbonBadgeModel.find({});
    return {
      ribbons: ribbons_badges.filter(function (elem) {
        return elem.type == 'ribbon';
      }),
      badges: ribbons_badges.filter(function (elem) {
        return elem.type == 'badge';
      }),
      allergens: await this.allergyModel.find({}),
      dietary_attribures: await this.dietaryModel.find({}),
      booking_statuses: Object.values(BookingStatus),
      cuisines: await this.cuisineModel.find({}),
      user_audit_types: Object.values(UserAuditTypeEnum),
      user_audit_statues: Object.values(UserAuditStatusEnum),
      user_audit_filter_statuses: Object.values(UserAuditStatusEnumForDto),
      facilities: await this.facilitiesModel.find({ userId: null }),
      house_rules: Object.values({
        foodRestrictionApplied: {
          name: 'Outside Food Restriction',
          url: 'icons/house-rules/outside_food_restriction.svg',
          value: 'foodRestrictionApplied',
        },
        smokingRestrictionApplied: {
          name: 'No Smoking',
          url: 'icons/house-rules/no_smoking.svg',
          value: 'smokingRestrictionApplied',
        },
        dressCodeRestrictionApplied: {
          name: 'Restricted Dress Code',
          url: 'icons/house-rules/dress_code.svg',
          value: 'dressCodeRestrictionApplied',
        },
        petsRestrictionApplied: {
          name: 'Pets Not Allowed',
          url: 'icons/house-rules/pets_not_allowed.svg',
          value: 'petsRestrictionApplied',
        },
      }),
    };
  }

  public async add_refernce_data(): Promise<any> {
    // await this.add_to_db(this.allergyModel, allergies);
    // await this.add_to_db(this.foodtypeModel, food_types);
    // await this.add_to_db(this.dietaryModel, dietary_attribures);
    // await this.add_to_db(this.trainingModel, trainings);
    // await this.add_to_db(this.unitsModel, weights);
    // await this.add_to_db(this.cuisineModel, cuisines);
    // await this.add_to_db(this.facilitieModel, facilities);
    return true;
  }

  private async add_to_db(model, data) {
    await model.deleteMany();
    await model.insertMany(data);
  }

  public async get_cities(country_name: string): Promise<any> {
    try {
      return await this.cityModel.find(
        { country: { $regex: country_name.toLowerCase(), $options: 'i' } },
        { city_name: 1 },
      );
    } catch (err) {
      throw err;
    }
  }

  public async get_weighing_units(): Promise<any> {
    try {
      return await this.unitsModel.find({});
    } catch (err) {
      throw err;
    }
  }
}

