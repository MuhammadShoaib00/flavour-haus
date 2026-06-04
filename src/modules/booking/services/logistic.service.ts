import { Injectable, Logger } from "@nestjs/common";
import { LogisticRepository } from "../repositories/logistic.repository";

@Injectable()
export class LogisticService {
  constructor(private logisticRepository: LogisticRepository) {}

  async updateLogisticTracker({ bookingId, logisticBody }: { bookingId: string; logisticBody: any }) {
    const logisticUpdated = logisticBody;
    const logistic = await this.viewOfCreateLogisticTracker(bookingId);
    await this.logisticRepository.findOneAndUpdate({ bookingId: bookingId }, logisticUpdated);
    return logistic;
  }

  async viewOfCreateLogisticTracker(bookingId) {
    const existingLogistic = await this.logisticRepository.getLogisticsWithBookingNo(bookingId);
    if (existingLogistic && existingLogistic.length > 0) {
      return existingLogistic;
    }
    let logisticObj = {
      bookingId: bookingId,
      completePercentage: '0',
      progressTracker: 'Event Booked',
      timerValue: '0'
    }
    await this.logisticRepository.create(logisticObj);
    return await this.logisticRepository.getLogisticsWithBookingNo(bookingId);
  }
}
