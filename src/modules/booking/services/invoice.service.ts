import { Injectable, Logger } from '@nestjs/common';
import { InvoiceRepository } from '../repositories/invoice.repository';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private invoiceRepository: InvoiceRepository,
  ) { }

  async listInvoices(payload: {userId: string, userRole: string, search: string, limit: number, offset: number}) {
    try {
      const { userId, userRole, search, limit, offset } = payload;
      return await this.invoiceRepository.paginate({
        filterQuery: {
          userId,
          $or: [
            { invoiceNo: { $regex: search.toLowerCase(), $options: 'i' } },
            { referenceId: { $regex: search.toLowerCase(), $options: 'i' } },
            { referenceType: { $regex: search.toLowerCase(), $options: 'i' } },
          ],
      },
        limit,
        offset,
        pipelines: [
          {
            $project: { transactionData: 0 }
          }
        ],
        returnKey: "invoices"
      })
    } catch (err) {
      throw err;
    }
  }

  async viewInvoice(payload: {invoiceId: string, userId: string | null}) {
    try {
      const {invoiceId, userId} = payload;
      const filter: any = {_id: invoiceId};
      if(userId != null){
        filter.userId = userId;
      }
      return await this.invoiceRepository.findOne(filter);
    } catch (err) {
      throw err;
    }
  }
}
