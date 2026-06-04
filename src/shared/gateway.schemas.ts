import { AllergySchema } from "./interfaces/reference_data/schemas/allergens.schema";
import { AuditLogSchema } from "./interfaces/reference_data/schemas/audit_log.schema ";
import { CitySchema } from "./interfaces/reference_data/schemas/cities.schema";
import { CuisineSchema } from "./interfaces/reference_data/schemas/cuisines.schema";
import { DietaryAttributeSchema } from "./interfaces/reference_data/schemas/dietary_attributes.schema";
import { FacilitiesSchema } from "./interfaces/reference_data/schemas/facilities.schema";
import { FoodTypeSchema } from "./interfaces/reference_data/schemas/food_type.schema";
import { RibbonBadgeSchema } from "./interfaces/reference_data/schemas/ribbons_badges.schema";
import { TrainingSchema } from "./interfaces/reference_data/schemas/trainings.schema";
import { WeighingSchema } from "./interfaces/reference_data/schemas/weighing_unit.schema";

export const gateway_schemas = [
    {
        name: 'Cuisines',
        schema: CuisineSchema,
    },
    {
        name: 'Allergens',
        schema: AllergySchema,
    },
    {
        name: 'Dietary_attributes',
        schema: DietaryAttributeSchema,
    },
    {
        name: 'Ribbons_badges',
        schema: RibbonBadgeSchema,
    },
    {
        name: 'Food_types',
        schema: FoodTypeSchema,
    },
    {
        name: 'Trainings',
        schema: TrainingSchema,
    },
    {
        name: 'Cities',
        schema: CitySchema,
    },
    {
        name: 'Facilities',
        schema: FacilitiesSchema,
    },
    {
        name: 'AuditLog',
        schema: AuditLogSchema,
    },
    {
        name: 'Weighing_units',
        schema: WeighingSchema,
    },
]
