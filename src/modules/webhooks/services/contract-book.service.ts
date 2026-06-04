import { HttpException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Webhook } from '../schemas/webhook.schema';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserRepository } from '../repositories/user.repository';
import { WebhookRepository } from '../repositories/webhook.repository';
import { ContractBookDto } from '../dto/contract-book.dto';
import { S3Service } from './s3.service';
@Injectable()
export class ContractBookService {
  private readonly logger = new Logger(ContractBookService.name);
  private readonly template = process.env.CONTRACT_BOOK_TEMPLATE_ID;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Webhook.name)
    private webhookRepo: WebhookRepository,
    @InjectModel(User.name)
    private userRepo: UserRepository,
    private s3service: S3Service,
  ) {}

  async getContractPdf(contractId: string) {
    try {
      let connection = await firstValueFrom(
        this.httpService.get(`documents/${contractId}/pdf`, {
          responseType: 'arraybuffer',
        }),
      );
      if (connection.status == 200 || connection.status == 201) {
        return await this.s3service.uploadFileFromBuffer(
          contractId,
          connection.data,
        );
      }
      this.logger.log('ContractBook PDF Error', {
        err: connection.data?.error,
        contractId,
      });
      throw new HttpException(connection.data?.error, connection.status);
    } catch (err) {
      this.logger.log('ContractBook PDF Catch Error', {
        err: err.message,
        contractId,
      });
      throw new HttpException(err.message, 500);
    }
  }

  async contractBookWebhook(payload: ContractBookDto) {
    const { contract, event } = payload;
    if (contract.title != process.env.CONTRACT_BOOK_TEMPLATE_NAME) {
      return false;
    }

    if (
      ![
        'contract.signed',
        'contract.rejected',
        'contract.changes_requested',
      ].includes(event)
    ) {
      return false;
    }

    try {
      payload = { ...payload };
      await this.saveWebhook(payload);
      const user = await this.userRepo.findOne(
        { 'contractBookData.id': contract.id },
        { 'license.premisesPermissionFile': 0, 'dbsCheck.file': 0 },
      );
      if (user == null) {
        this.logger.error(contract);
        return false;
      }

      let pdf_file = null;
      try {
        pdf_file = await this.getContractPdf(contract.id);
      } catch (e) {
        this.logger.log('PDF File', e.message);
      }

      await this.updateUserContractBook(user, contract, pdf_file);
      return true;
    } catch (err) {
      return err.message;
    }
  }

  private async saveWebhook(payload) {
    const data = {
      service: 'contract_book',
      type: payload.event,
      data: payload,
      code: 200,
    };
    return await this.webhookRepo.create(data);
  }

  private async updateUserContractBook(user, contract, pdf_file) {
    const contractBookDataPayload = {
      id: user.contractBookData.id,
      title: user.contractBookData.title,
      status: contract.state,
      data: {
        ...contract,
        ...pdf_file,
      },
      createdAt: user.contractBookData.createdAt,
      updatedAt: new Date(),
    };
    await this.userRepo.findOneAndUpdate(
      { 'contractBookData.id': contract.id },
      { contractBookData: contractBookDataPayload },
    );
  }
}
