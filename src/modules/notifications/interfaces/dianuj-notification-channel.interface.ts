import { IDianujNotification } from "./dianuj-notification.interface";

export interface IDianujNotificationChannel {
  send(notification: IDianujNotification): Promise<any>;
}