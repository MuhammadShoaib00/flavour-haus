import { CacheInterceptor, CacheTTL, Controller, Get, Logger, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReferenceService } from '../reference/reference.service';
import { GetReferenceDataResponseDto } from './../dto/reference/get-reference-data-response.dto';
import { ApiDescription, Roles } from '../shared/decorators/custom';
import { Role } from '../shared/interfaces/role';
import { GetWeighingUnitsResponseDto } from '../dto/reference/get-units-data-response.dto';
import { ApiRoute } from '../shared/decorators/custom/api-route.decorator';

@ApiTags('ReferenceData')
@Controller('reference-data')
export class ReferenceController {
  private readonly logger = new Logger(ReferenceController.name);
  constructor(private readonly reference_service: ReferenceService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(0)
  @Get()
  @ApiDescription('Getting Reference Data')
  @ApiOkResponse({
    type: GetReferenceDataResponseDto,
    description: 'List of all reference data for users',
  })
  public async getReferenceData(): Promise<GetReferenceDataResponseDto> {
    return {
      data: await this.reference_service.get_reference_data(),
      message: 'Reference Data',
      errors: null,
    };
  }

 
  @Get('add_data')
  @ApiRoute.LIST({
    name: 'Add Reference',
    description: ' Added Reference Data',
    roles: [Role.SYS_ADMIN],
  })
  @ApiOkResponse({
    description: 'Add all reference data to database',
  })
  public async addReferenceData(): Promise<GetReferenceDataResponseDto> {
    await this.reference_service.add_refernce_data();
    return {
      data: null,
      message: 'Reference Data added',
      errors: null,
    };
  }

  @Get('get_city')
  @ApiDescription('Getting Cities')
  @ApiOkResponse({
    description: 'Get cities by country name',
  })
  public async getCities(
    @Query('country_name') country: string,
  ): Promise<GetReferenceDataResponseDto> {
    return {
      data: await this.reference_service.get_cities(country),
      message: 'Cities Data',
      errors: null,
    };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(0)
  @Get('get_weighing_units')
  @ApiDescription('Getting Weighing Units')
  @ApiOkResponse({
    description: 'Getting All Weighing Units',
  })
  public async getWeghingUnits(): Promise<GetWeighingUnitsResponseDto> {
    return {
      message: 'All Weighing Units',
      data: await this.reference_service.get_weighing_units(),
      errors: null,
    };
  }
}

