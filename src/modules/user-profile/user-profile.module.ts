import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { EmailModule } from './shared/services/email.module';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserTrainingsService } from './services/user_trainings.service';
import { TrainingsRepository } from './repositories/trainings.repository';
import { UserTrainingsRepository } from './repositories/user_trainings.repository';
import { UserRibbonsRepository } from './repositories/user_ribbons.repository';
import { UserRibbonsService } from './services/user_ribbons.service';
import { KitchenService } from './services/kitchen.service';
import { KitchenRepository } from './repositories/kitchen.repository';
import { FacilityRepository } from './repositories/facilities.repository';
import { FoodIngredientRepository } from './repositories/food-ingredient.repository';
import { HouseRulesService } from './services/house-rules.service';
import { ContractBookService } from './services/contract-book.service';
import { UserAuditService } from './services/user_audit.service';
import { UserAuditRepository } from './repositories/user-audit.repository';
import { SearchService } from './services/search.service';
import { AACLeadGenerationService } from './services/acc-api.service';
import { User, UserSchema } from './schemas/user.schema';
import { Trainings, TrainingsSchema } from './schemas/trainings.schema';
import { UserTraining, UserTrainingsScehma } from './schemas/user_trainings.schema';
import { Kitchen, KitchenSchema } from './schemas/kitchen.shema';
import { UserRibbons, RibbonsSchema } from './schemas/user_ribbons.schema';
import { Facility, FacilitySchema } from './schemas/facilities.schema';
import { FoodIngredient, FoodIngredientSchema } from './schemas/food-ingredient.schema';
import { UserAudit, UserAuditSchema } from './schemas/user_audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Trainings.name, schema: TrainingsSchema },
      { name: UserTraining.name, schema: UserTrainingsScehma },
      { name: Kitchen.name, schema: KitchenSchema },
      { name: UserRibbons.name, schema: RibbonsSchema },
      { name: Facility.name, schema: FacilitySchema },
      { name: FoodIngredient.name, schema: FoodIngredientSchema },
      { name: UserAudit.name, schema: UserAuditSchema },
    ]),
    HttpModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 3,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    EmailModule,
  ],
  providers: [
    UserService,
    UserRepository,
    UserTrainingsService,
    KitchenService,
    TrainingsRepository,
    UserTrainingsRepository,
    KitchenRepository,
    UserRibbonsRepository,
    UserRibbonsService,
    FacilityRepository,
    FoodIngredientRepository,
    HouseRulesService,
    ContractBookService,
    UserAuditService,
    UserAuditRepository,
    SearchService,
    AACLeadGenerationService,
  ],
  exports: [
    UserService,
    UserRepository,
    KitchenService,
    KitchenRepository,
    UserTrainingsService,
    UserRibbonsService,
    HouseRulesService,
    UserAuditService,
    SearchService,
  ],
})
export class UserProfileModule {}
