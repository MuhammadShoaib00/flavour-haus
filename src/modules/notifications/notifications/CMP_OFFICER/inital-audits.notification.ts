import { DatabaseChannel } from '../../channels/database.channel';
import { NOTIFICATION_PATTERNS } from '../../constants';
import { IDianujNotification } from '../../interfaces/dianuj-notification.interface';

export class InitialAuditsNotification implements IDianujNotification{
    private data: any;

    constructor(data: any) {
        this.data = data;
    }

    public sendToChannels() {
        return [
            DatabaseChannel,
        ];
    }

    toDatabase(): {userId: string, type: string, data: any, title: string, message: string}{
        return{
            title: "Assigned inital aduits",
            message: `Admin have assigned you new initial audits for you to audit`,
            type: NOTIFICATION_PATTERNS.CMP_OFFICER.ASSIGNED_INITIAL_AUDITS,
            userId: this.data.userId,
            data: this.data.data
        }
    }
}