import {
  Body,
  Controller,
  Post,
  Logger,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContractBookDto } from '../dto/contract-book.dto';
import { ContractBookService } from '../services/contract-book.service';

@ApiTags('Contract Book')
@Controller('contract-book')
export class ContractBookController {
  protected readonly logger = new Logger(ContractBookController.name);
  constructor(
    private readonly contractBookService: ContractBookService
  ) { }

  @Get()
  async getReq() {
    return {
      health: 'Excellent',
    }
  }

  @Post()
  async postReq(@Body() dto: ContractBookDto) {
    return await this.contractBookService.contractBookWebhook(dto);
  }
}
