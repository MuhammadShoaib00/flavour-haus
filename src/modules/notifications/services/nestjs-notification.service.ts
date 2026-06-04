import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IDianujNotification } from '../interfaces/dianuj-notification.interface';
import { IDianujNotificationChannel } from '../interfaces/dianuj-notification-channel.interface';

@Injectable()
export class NestJsNotification {
  private resolveChannel = (channel: Type<IDianujNotificationChannel>) => {
    return this.moduleRef.create(channel);
  }

  constructor(private moduleRef: ModuleRef) {}

  public send(notification: IDianujNotification): Promise<any> {
    const channels = notification.sendToChannels();
    return Promise.all(
      channels.map((channel: Type<any>) =>
        this.sendOnChannel(notification, channel),
      ),
    );
  }
  
  private async sendOnChannel(notification, clientChannel: Type<IDianujNotificationChannel>): Promise<any> {
    return (await this.resolveChannel(clientChannel)).send(notification);
  }
}