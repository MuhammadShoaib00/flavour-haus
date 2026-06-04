import { CacheInterceptor, CacheTTL, Controller, Get, Logger, Render, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDescription } from '../shared/decorators/custom';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  protected readonly logger = new Logger(HealthCheckController.name);

  @Get('')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @ApiDescription('Check Health Of Application')
  checkHealth() {
    return [{ healthCheckPassed: true, healthCheck: 'Excellent', name: 'Flavor Haus Monolith Application' }];
  }

  @Get('view')
  @Render('health_check')
  healthCheckView() {
    return { data: this.checkHealth() };
  }
}
