import { ForbiddenException } from '@nestjs/common';

export class HostNotConfirmed extends ForbiddenException {}
