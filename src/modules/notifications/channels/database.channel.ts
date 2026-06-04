import { Injectable } from '@nestjs/common';
import { IDianujNotificationChannel } from '../interfaces/dianuj-notification-channel.interface';
import { IDianujNotification } from '../interfaces/dianuj-notification.interface';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class DatabaseChannel implements IDianujNotificationChannel {
  constructor(private notificationRepo: NotificationRepository) {
  }

  public async send(notification: IDianujNotification): Promise<void> {
    const db_notification = notification.toDatabase();
    const _noti = {
      userId: db_notification.userId,
      type: db_notification.type, 
      data: db_notification.data || {},
      title: db_notification.title || '',
      message: db_notification.message|| '',
    };
    await this.notificationRepo.create(_noti);
  }

  getData(notification: IDianujNotification) {
    return notification.toDatabase();
  }
}