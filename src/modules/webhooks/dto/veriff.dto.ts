import { ApiProperty } from '@nestjs/swagger';

export class VeriffEventDto {
  id: string;
  code: number;
  action: string;
  feature: string;
  attemptId: string;
  vendorData: string;
  date?: Date;
}