import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserNotificationService } from './services/user-notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { DatabaseChannel } from './channels/database.channel';
import { EmailChannel } from './channels/email.channel';
import { NestJsNotification } from './services/nestjs-notification.service';
import { EmailModule } from '../../shared/services/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    EmailModule,
  ],
  providers: [
    UserNotificationService,
    NotificationRepository,
    DatabaseChannel,
    EmailChannel,
    NestJsNotification,
  ],
  exports: [
    UserNotificationService,
    NestJsNotification,
    DatabaseChannel,
    EmailChannel,
  ],
})
export class NotificationsModule {}
