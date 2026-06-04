import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
    from: string = process.env.ECS_SENDER_EMAIL,
    attachments?: nodemailer.SendMailOptions['attachments'],
  ) {
    try {
      const response = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        attachments,
      });

      this.logger.log(`Email sent to ${to}, Message ID: ${response.messageId}`);

      return response;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
