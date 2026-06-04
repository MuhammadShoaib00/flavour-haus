import {
  Module,
  OnApplicationBootstrap,
  NestModule,
  MiddlewareConsumer,
  BadGatewayException,
  CacheModule,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';

import { SharedModule } from './shared/modules/shared.module';
import { ReferenceModule } from './reference/reference.module';
import { UserAccountModule } from './modules/user-account/user-account.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ListingsModule } from './modules/listings/listings.module';
import { MenuModule } from './modules/menu/menu.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { SystemModule } from './modules/system/system.module';
import { BookingModule } from './modules/booking/booking.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

import { AuthNGuard } from './shared/guards/authN.guard';
import { AuthZGuard } from './shared/guards/authZ.guard';
import { ExceptionsFilter } from './shared/filters/exceptions.filter';
import { AuditLogsInterceptor } from './shared/interceptors/audit-logs.interceptor';
import { WinstonService } from './shared/config/winston.service';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { RouterMiddleware } from './shared/middleware/router.middleware';
import { SwaggerService } from './shared/swagger.service';
import { PermissionService } from './modules/user-account/services/permission.service';
import { AuthController } from './controllers/auth.controller';
import { BackupController } from './controllers/backup.controller';
import { BookingsController } from './controllers/booking.controller';
import { CalendarController } from './controllers/calendar.controller';
import { AdminDashboardController } from './controllers/dashboard.controller';
import { HealthCheckController } from './controllers/healthcheck.controller';
import { IngredientsController } from './controllers/ingredients.controller';
import { InvoiceController } from './controllers/invoice.controller';
import { ListingsController } from './controllers/listings.controller';
import { LogisticController } from './controllers/logistic.controller';
import { MenuController } from './controllers/menu.controller';
import { PermissionController } from './controllers/permission.controller';
import { RecipesController } from './controllers/recipes.controller';
import { RoleController } from './controllers/role.controller';
import { SearchController } from './controllers/search.controller';
import { SystemAdminController } from './controllers/system_admin.controller';
import { UserNotificationController } from './controllers/user-notification.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserRightController } from './controllers/user-rights.controller';
import { UserController } from './controllers/user.controller';
import { UserAuditController } from './controllers/user_audits.controller';
import { UserRibbonsController } from './controllers/user_ribbons.controller';
import { UserTrainingsController } from './controllers/user_trainings.controller';
import { WishlistController } from './controllers/wish_list.controller';

const schemaObject = {
  NODE_ENV: Joi.string().allow('development', 'production').required(),
  GATEWAY_BASE_URI: Joi.string().optional(),
  GATEWAY_PORT: Joi.number().optional(),
  MONGO_DSN: Joi.string().required(),
  MONGO_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().optional(),
  JWT_RESET_SECRET: Joi.string().optional(),
  AZURE_STORAGE_ACCOUNT_NAME: Joi.string().optional(),
  AZURE_STORAGE_ACCOUNT_KEY: Joi.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: Joi.string().optional(),
  ACS_CONNECTION_STRING: Joi.string().optional(),
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_CURRENCY: Joi.string().optional(),
  CONTRACT_BOOK_API_KEY: Joi.string().optional(),
  CONTRACT_BOOK_URL: Joi.string().optional(),
  AAC_API_URL: Joi.string().optional(),
  AAC_API_KEY: Joi.string().optional(),
  CLOUDWATCH_GROUP_NAME: Joi.string().optional(),
  CLOUDWATCH_STREAM_NAME: Joi.string().optional(),
  CLOUDWATCH_AWS_REGION: Joi.string().optional(),
  CLOUDWATCH_AWS_ACCESS_KEY: Joi.string().optional(),
  CLOUDWATCH_AWS_SECRET_KEY: Joi.string().optional(),
  CLOUDWATCH_LOGS: Joi.boolean().optional(),
};

const buildMongoUri = (dsn: string, database: string): string => {
  const trimmedDsn = dsn.trim();
  const trimmedDatabase = database.trim().replace(/^\/+|\/+$/g, '');
  const queryStart = trimmedDsn.indexOf('?');
  const base = queryStart >= 0 ? trimmedDsn.slice(0, queryStart) : trimmedDsn;
  const query = queryStart >= 0 ? trimmedDsn.slice(queryStart) : '';
  const authorityStart = base.indexOf('://') + 3;
  const pathStart =
    authorityStart > 2 ? base.indexOf('/', authorityStart) : base.indexOf('/');
  const baseWithoutPath =
    pathStart >= 0 ? base.slice(0, pathStart) : base.replace(/\/+$/g, '');

  return `${baseWithoutPath}/${trimmedDatabase}${query}`;
};

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MulterModule.register({ limits: { fileSize: 2200000 } }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object(schemaObject),
    }),
    WinstonModule.forRootAsync({ useClass: WinstonService }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: buildMongoUri(
          config.get<string>('MONGO_DSN'),
          config.get<string>('MONGO_DATABASE'),
        ),
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    ReferenceModule,
    UserAccountModule,
    UserProfileModule,
    NotificationsModule,
    ListingsModule,
    MenuModule,
    CalendarModule,
    WishlistModule,
    SystemModule,
    BookingModule,
    WebhooksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthNGuard },
    { provide: APP_GUARD, useClass: AuthZGuard },
    { provide: APP_FILTER, useClass: ExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditLogsInterceptor },
  ],
  controllers: [
    AuthController,
    BackupController,
    BookingsController,
    CalendarController,
    AdminDashboardController,
    HealthCheckController,
    IngredientsController,
    InvoiceController,
    ListingsController,
    LogisticController,
    MenuController,
    PermissionController,
    RecipesController,
    RoleController,
    SearchController,
    SystemAdminController,
    UserNotificationController,
    UserProfileController,
    UserRightController,
    UserController,
    UserAuditController,
    UserRibbonsController,
    UserTrainingsController,
    WishlistController,
  ],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
  constructor(
    private config: ConfigService,
    private permissionService: PermissionService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    if (
      this.config.get('NODE_ENV') != 'production' &&
      this.config.get('CLOUDWATCH_LOGS') == 'true'
    ) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
    }
    consumer.apply(RouterMiddleware).forRoutes('*');
  }

  async onApplicationBootstrap() {
    if (
      this.config.get('NODE_ENV') == 'development' &&
      this.config.get('PERMISSION_SYNC') == 'true'
    ) {
      try {
        const document = SwaggerService._document;
        await this.permissionService.addPermissions(document);
      } catch (err) {
        throw new BadGatewayException();
      }
    }
  }
}
