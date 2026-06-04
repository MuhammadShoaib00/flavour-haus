import { Injectable, Logger } from '@nestjs/common';
import { IDianujNotificationChannel } from '../interfaces/dianuj-notification-channel.interface';
import { IDianujNotification } from '../interfaces/dianuj-notification.interface';
import * as ejs from 'ejs';
import { join } from 'path';
import { promises as fs } from 'fs';
import { EmailService } from '../../../shared/services/email.service';

@Injectable()
export class EmailChannel implements IDianujNotificationChannel {
  constructor(private readonly emailService: EmailService) {}

  // public async send(notification: IDianujNotification): Promise<void> {
  //   const noti = notification.toEmail();
  //   let options = {
  //       to: noti.email,
  //       subject: noti.subject,
  //       template: './'+noti.template,
  //       context: {
  //         message: noti.message,
  //         data: noti.data,
  //       },
  //   }
  //   if(noti.from != null){
  //       options['from'] = `"${noti.from.name}" <${noti.from.email}>`;
  //   }
  //   await this.mailerService.sendMail(options);
  // }

  public async send(notification: IDianujNotification): Promise<void> {
    const _notification = notification.toEmail();
    const data = _notification.data as {
      attachments?: any[];
      subject: string;
      to: string;
      from: string;
      text: string;
    };

    const htmlContent = await this.generateHtmlContent(
      _notification.template,
      _notification.data,
    );

    const attachments =
      data.attachments && data.attachments.length > 0
        ? data.attachments.map((attachment) => {
        return {
          filename: attachment.filename,
          content: attachment.content,
          encoding: attachment.encoding || 'base64',
          contentType: attachment.contentType,
        };
      })
        : undefined;

    try {
      await this.emailService.sendMail(
        _notification.email,
        _notification.subject,
        htmlContent,
        process.env.ECS_SENDER_EMAIL,
        attachments,
      );
    } catch (error) {
      throw new Error(`SMTP email sending failed: ${error.message}`);
    }
  }

  private async generateHtmlContent(
    template: string,
    data: any,
  ): Promise<string> {
    const logger = new Logger(EmailChannel.name);
    try {
      const templateLocations = [
        join(
          __dirname,
          '..',
          '..',
          'src',
          'email_templates',
          `${template}.ejs`,
        ),

        join(__dirname, '..', 'email_templates', `${template}.ejs`),
      ];

      let templateContent: string | null = null;
      let foundTemplatePath: string | null = null;

      for (const templatePath of templateLocations) {
        try {
          templateContent = await fs.readFile(templatePath, 'utf-8');
          foundTemplatePath = templatePath;
          logger.log(`Found template at: ${templatePath}`);
          break;
        } catch {
          // Try next path
        }
      }

      if (!templateContent) {
        throw new Error(
          `Template not found at any of: ${templateLocations.join(', ')}`,
        );
      }

      return ejs.render(
        templateContent,
        { ...data, azureBaseUrl: process.env.AZURE_STORAGE_BASE_URL },
        { filename: foundTemplatePath },
      );
    } catch (error) {
      logger.error(`Template rendering error: ${error.message}`, error.stack);
      throw new Error('Failed to generate email content');
    }
  }
}
