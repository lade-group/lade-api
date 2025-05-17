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
    if (!teamId) {
      return {
        data: [],
        total: 0,
      };
    }

    const { data: vehicles, total } = await this.vehicleService.findAll({
      teamId,
      skip: parseInt(skip, 10) || 0,
      take: parseInt(take, 10) || 10,
      status,
      type,
    });

    return {
      data: vehicles,
      total,
    };
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
