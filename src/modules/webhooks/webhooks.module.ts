import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ContractBookService } from './services/contract-book.service';
import { WebhookRepository } from './repositories/webhook.repository';
import { UserRepository } from './repositories/user.repository';
import { ContractBookController } from './controllers/contract-book.controller';
import { CheckVeriffSignatureGuard } from './shared/guards/check-veriff-signature.guard';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UserAccountModule } from '../user-account/user-account.module';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HttpModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        timeout: 50000,
        maxRedirects: 3,
        baseURL: config.get('CONTRACT_BOOK_URL'),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.get('CONTRACT_BOOK_API_KEY')}`,
        },
      }),
      inject: [ConfigService],
    }),
    UserAccountModule,
    UserProfileModule,
  ],
  controllers: [ContractBookController],
  providers: [
    UserRepository,
    WebhookRepository,
    ContractBookService,
    CheckVeriffSignatureGuard,
  ],
})
export class WebhooksModule {}
