import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './services/booking.service';
import { BookingRepository } from './repositories/booking.repository';
import { BookingTimelineRepository } from './repositories/booking-timeline.repository';
import { ReviewRepository } from './repositories/review.repository';
import { UserRepository } from './repositories/user.repository';
import { KitchenRepository } from './repositories/kitchen.repository';
import { InvoiceRepository } from './repositories/invoice.repository';
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';
import { LogisticRepository } from './repositories/logistic.repository';
import { LogisticService } from './services/logistic.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { BookingTimeline, BookingTimelineSchema } from './schemas/booking-timeline.schema';
import { ReviewSchema } from './schemas/review.schema';
import { Kitchen, KitchenSchema } from './schemas/kitchen.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { Logistic, LogisticSchema } from './schemas/logistic.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: BookingTimeline.name, schema: BookingTimelineSchema },
      { name: 'reviews', schema: ReviewSchema },
      { name: Kitchen.name, schema: KitchenSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Logistic.name, schema: LogisticSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    BookingService,
    BookingRepository,
    BookingTimelineRepository,
    ReviewRepository,
    UserRepository,
    KitchenRepository,
    InvoiceRepository,
    PaymentService,
    InvoiceService,
    LogisticRepository,
    LogisticService,
  ],
  exports: [BookingService, InvoiceService, LogisticService],
})
export class BookingModule {}
