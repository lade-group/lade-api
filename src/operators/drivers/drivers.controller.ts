import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { DriverService } from './drivers.service';
import { CreateDriverDto } from '../dto/create-driver.dto';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Drivers')
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'teamId', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findAll(
    @Query('teamId') teamId: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.driverService.findAll({
      teamId,
      status: status?.trim() || undefined,
      skip: parseInt(skip || '0', 10),
      take: parseInt(take || '10', 10),
    });
  }

  @Get('filters')
  @ApiOperation({ summary: 'Obtener estatus disponibles para conductores' })
  @ApiOkResponse({
    schema: {
      example: { statusOptions: ['DISPONIBLE', 'EN_VIAJE', 'DESACTIVADO'] },
    },
  })
  getFilters() {
    return this.driverService.getFilters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }
}
