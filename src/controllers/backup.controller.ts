import {
  Body,
  Controller,
  Get,
  Query,
  Logger,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';
import { Role } from '../shared/interfaces/role';
import { PageLimitDto, PageOffsetDto } from '../dto/common/PageLimitOffset.dto';
import { AllBackupsDto, DeletingBackupsRequest } from '../dto/user/backups.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from '../modules/system/services/backup.service';

@ApiTags('Backup')
@Controller('backups')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);
  constructor(private backupService: BackupService) {}

  @Get('')
  @ApiRoute.LIST({
    name: 'View All Backups',
    roles: [Role.SYS_ADMIN],
    description: 'Get All Backups',
  })
  @ApiCreatedResponse({ type: AllBackupsDto })
  @ApiQuery({ name: 'date', type: String, example: '2022-12-21', required: false })
  @ApiQuery({ name: 'limit', type: PageLimitDto })
  @ApiQuery({ name: 'offset', type: PageOffsetDto })
  async getAllBackups(
    @Query('date') date: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const data = await this.backupService.getAllBackups({ date, offset, limit });
    return { errors: null, data, message: 'All Backups' };
  }

  @ApiRoute.LIST({
    name: 'View Backups',
    roles: [Role.SYS_ADMIN],
    description: 'Get Single Backups',
  })
  @Get(':backupId')
  @ApiParam({ example: '63a32044f4df02ffb06b7e16', type: String, name: 'backupId' })
  async getBackup(@Param('backupId') backupId: string) {
    const data = await this.backupService.getBackup(backupId);
    return { errors: null, data, message: 'Single Backup' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async backupStarted() {
    this.logger.verbose('Backup Started');
    await this.backupService.newBackup();
  }

  @ApiRoute.LIST({
    name: 'View Backups',
    roles: [Role.SYS_ADMIN],
    description: 'Get Backup File URL',
  })
  @Get(':backupId/file')
  @ApiParam({ example: '63a32044f4df02ffb06b7e16', type: String, name: 'backupId' })
  async getBackupFile(@Param('backupId') backupId: string) {
    return {
      errors: null,
      data: await this.backupService.getBackupFile(backupId),
      message: 'Backup File URL',
    };
  }

  @ApiRoute.DELETE({
    name: 'Delete Backups',
    roles: [Role.SYS_ADMIN],
    description: 'Delete Backup File URL',
  })
  @Delete('delete')
  async deleteBackup(@Body() dto: DeletingBackupsRequest) {
    await this.backupService.deleteBackup(dto.backupIds.map(String));
    return { errors: null, data: null, message: 'Backup(s) have been deleted' };
  }
}
