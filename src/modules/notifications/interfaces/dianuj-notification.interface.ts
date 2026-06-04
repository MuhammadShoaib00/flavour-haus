import { Type } from '@nestjs/common';
import { IDianujNotificationChannel } from './dianuj-notification-channel.interface';

export interface IDianujNotification {
  sendToChannels(): Type<IDianujNotificationChannel>[];
  toDatabase?(): {userId: string, type: string, data: any, title: string, message: string};
  toEmail?(): {template: string, email: string, data: any, subject: string, message: string, from?: {name: string, email: string}};
  toSMS?(): {message: string};
}