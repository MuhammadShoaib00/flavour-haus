import { DatabaseChannel } from '../channels/database.channel';
import { EmailChannel } from '../channels/email.channel';
import { NOTIFICATION_PATTERNS } from '../constants';
import { IDianujNotification } from '../interfaces/dianuj-notification.interface';

export class SignupStatusNotification implements IDianujNotification {
  private data: any;
  private message: string;
  private template: string;

  constructor(data: any) {
    this.data = data;
    if (data.status == 'Approved') {
      this.message = 'Congratulation!! You account have been approved';
      this.template = 'signup-approved';
    } else {
      this.message = 'Sorry!! You account have been rejected';
      this.template = 'signup-rejected';
    }
  }

  public sendToChannels() {
    return [DatabaseChannel, EmailChannel];
  }

  toDatabase(): {
    userId: string;
    type: string;
    data: any;
    title: string;
    message: string;
  } {
    return {
      title: 'Signup Verification Status Update',
      message: this.message,
      type: NOTIFICATION_PATTERNS.GENERAL.SIGNUP_STATUS,
      userId: this.data._id,
      data: this.data.data,
    };
  }
  toEmail(): {
    template: string;
    email: string;
    data: any;
    subject: string;
    message: string;
  } {
    return {
      template: this.template,
      email: this.data.email,
      data: this.data,
      subject: this.message,
      message: '',
    };
  }
}
