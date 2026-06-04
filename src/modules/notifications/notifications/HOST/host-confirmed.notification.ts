import { DatabaseChannel } from '../../channels/database.channel';
import { EmailChannel } from '../../channels/email.channel';
import { NOTIFICATION_PATTERNS } from '../../constants';
import { IDianujNotification } from '../../interfaces/dianuj-notification.interface';

export class HostConfirmedNotification implements IDianujNotification{
    private data: {userId: string, email: string, name: string, status: string, auditType: string};

    constructor(data: {userId: string, email: string, name: string, status: string, auditType: string}) {
        this.data = data;
    }

    public sendToChannels() {
        return [
            DatabaseChannel,
            EmailChannel,
        ];
    }

    toDatabase(): {userId: string, type: string, data: any, title: string, message: string}{
        return{
            title: "Congratulation",
            message: `Your account have been verified and confirmed! Now you are able to list your listings.`,
            type: NOTIFICATION_PATTERNS.HOST.HOST_CONFIRMED,
            userId: this.data.userId,
            data: this.data
        }
    }

    toEmail(): { template: string; email: string; data: any; subject: string; message: string; } {
        return{
            template: 'host-confirmed',
            email: this.data.email,
            data: this.data,
            subject: "Congratulation!! You account have been confirmed",
            message: ""
        }
    }
}