import { HttpException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContractBookService {
  private readonly logger = new Logger(ContractBookService.name);
  private readonly template = process.env.CONTRACT_BOOK_TEMPLATE_ID;

  constructor(private readonly httpService: HttpService, private config: ConfigService) {}

  async getContractTemplate() {
    try {
      let connection = await firstValueFrom(
        this.httpService.get(`${this.config.get('CONTRACT_BOOK_URL')}/contract-templates/${this.template}`, {
          headers: {
            'Authorization': `Bearer ${this.config.get('CONTRACT_BOOK_API_KEY')}`,
          }
        }),
      );
      if (connection.status == 200 || connection.status == 201) {
        return connection.data;
      }
      if (connection.data.error != undefined || connection.data.error != null) {
        return connection.data.error;
      }
      throw new HttpException(connection.data, connection.status);
    } catch (err) {
      throw err;
    }
  }

  async createContractFromTemplate(data: object) {
    try {
      let connection = await firstValueFrom(
        this.httpService.post(`${this.config.get('CONTRACT_BOOK_URL')}/contract-templates/${this.template}/send`, data, {
          headers: {
            'Authorization': `Bearer ${this.config.get('CONTRACT_BOOK_API_KEY')}`,
          }
        }),
      );
      if (connection.status == 200 || connection.status == 201) {
        return connection.data;
      }
      if (connection.data.error != undefined || connection.data.error != null) {
        return connection.data.error;
      }
      throw new HttpException(connection.data, connection.status);
    } catch (err) {
      throw err;
    }
  }
}

