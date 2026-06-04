import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../shared/interfaces/role';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { GetInvoicesResponse, GetSingInvoiceResponse } from '../dto/user/invoices.dto';
import { InvoiceService } from '../modules/booking/services/invoice.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  protected readonly logger = new Logger(InvoiceController.name);
  constructor(private invoiceService: InvoiceService) {}

  @Get()
  @ApiRoute.LIST({
    name: 'Invoices',
    description: 'Invoices list',
    roles: [Role.HOST, Role.SYS_ADMIN, Role.GUEST],
  })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  @ApiQuery({ name: 'filter', type: String, required: false })
  @ApiQuery({ name: 'userId', type: String, required: false })
  @ApiCreatedResponse({ type: GetInvoicesResponse })
  async getInvoices(
    @Req() req,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('filter') search: string,
    @Query('userId') userId: string,
  ) {
    let user_id = null;
    switch (req.user.defaultRole) {
      case Role.HOST:
      case Role.GUEST:
        user_id = req.user.userId;
        break;
      case Role.SYS_ADMIN:
        user_id = userId;
        break;
    }
    const invoices = await this.invoiceService.listInvoices({
      userId: user_id,
      userRole: req.user.defaultRole,
      limit,
      offset,
      search,
    });
    return { data: invoices, message: 'All Invoices', errors: null };
  }

  @Get('view/:invoiceId')
  @ApiRoute.LIST({
    name: 'Invoice Details',
    description: 'Get Invoice Details',
    roles: [Role.HOST, Role.GUEST, Role.SYS_ADMIN],
  })
  @ApiParam({ name: 'invoiceId', type: String, required: true, example: '63c5702257123ed3dae702a7' })
  @ApiCreatedResponse({ type: GetSingInvoiceResponse })
  async getInvoice(@Req() req, @Param('invoiceId') invoiceId) {
    let userId = null;
    switch (req.user.defaultRole) {
      case Role.HOST:
      case Role.GUEST:
        userId = req.user.userId;
        break;
    }
    return await this.invoiceService.viewInvoice({ invoiceId, userId });
  }
}
