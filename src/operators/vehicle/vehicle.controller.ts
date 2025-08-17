import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Put,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Auth } from '@/utils/decorators/auth.decorator';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Auth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Crear un nuevo vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body('data') data: string,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    try {
      const dto: CreateVehicleDto = JSON.parse(data);
      console.log('Creating vehicle with payload:', dto);
      const result = await this.vehicleService.create(dto, photo);
      console.log('Vehicle created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  @Get()
  @Auth()
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'teamId', required: true })
  @ApiOperation({ summary: 'Obtener lista paginada de vehículos' })
  async findAll(
    @Query('teamId') teamId: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      teamId,
      skip: parseInt(skip, 10) || 0,
      take: parseInt(take, 10) || 10,
      status: status?.trim() || undefined,
      type: type?.trim() || undefined,
      search: search?.trim() || undefined,
    };

    const result = await this.vehicleService.findAll(filters);
    return result;
  }

  @Get('filters')
  @Auth()
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

  @Get('paginated')
  @Auth()
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'teamId', required: true })
  @ApiOperation({
    summary: 'Obtener vehículos paginados con búsqueda avanzada',
  })
  async getPaginatedVehicles(
    @Query('teamId') teamId: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      teamId,
      skip: parseInt(skip, 10) || 0,
      take: parseInt(take, 10) || 10,
      status: status?.trim() || undefined,
      type: type?.trim() || undefined,
      search: search?.trim() || undefined,
    };

    return this.vehicleService.getPaginatedVehicles(filters);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @ApiResponse({
    status: 200,
    description: 'Vehículo actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @Patch(':id/status')
  @Auth()
  @ApiOperation({ summary: 'Actualizar el status de un vehículo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'DISPONIBLE',
            'EN_USO',
            'MANTENIMIENTO',
            'CANCELADO',
            'DESUSO',
          ],
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Status actualizado exitosamente' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.vehicleService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Desactivar un vehículo (cambiar status a DESUSO)' })
  @ApiResponse({
    status: 200,
    description: 'Vehículo desactivado exitosamente',
  })
  async remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
