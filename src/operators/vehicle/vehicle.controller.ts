import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { ApiQuery } from '@nestjs/swagger';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'teamId', required: true })
  async findAll(
    @Query('teamId') teamId: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const filters = {
      teamId,
      skip: parseInt(skip, 10) || 0,
      take: parseInt(take, 10) || 10,
      status: status?.trim() || undefined,
      type: type?.trim() || undefined,
    };

    const result = await this.vehicleService.findAll(filters);
    return result;
  }

  @Get('filters')
  @ApiOperation({ summary: 'Obtener filtros disponibles para vehículos' })
  @ApiOkResponse({
    description: 'Lista de opciones de estatus y tipos de vehículos',
    schema: {
      example: {
        statusOptions: [
          'DISPONIBLE',
          'EN_USO',
          'MANTENIMIENTO',
          'CANCELADO',
          'DESUSO',
        ],
        typeOptions: ['Camión', 'Van', 'Pickup'],
      },
    },
  })
  async getFilters() {
    return this.vehicleService.getFilters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
