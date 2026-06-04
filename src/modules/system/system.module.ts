import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BackupService } from './services/backup.service';
import { BackupRepository } from './repositories/backup.repository';
import { Backup, BackupSchema } from './schemas/backup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Backup.name, schema: BackupSchema },
    ]),
  ],
  providers: [BackupService, BackupRepository],
  exports: [BackupService],
})
export class SystemModule {}
