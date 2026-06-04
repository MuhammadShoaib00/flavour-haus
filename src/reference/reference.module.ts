import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferenceService } from './reference.service';
import { AuditLogService } from './audit.service';
import { ReferenceController } from '../controllers/reference.controller';
import { gateway_schemas } from '../shared/gateway.schemas';

@Module({
  imports: [MongooseModule.forFeature(gateway_schemas)],
  controllers: [ReferenceController],
  providers: [ReferenceService, AuditLogService],
  exports: [AuditLogService],
})
export class ReferenceModule {}
