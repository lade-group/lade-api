import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriverService } from './drivers.service';
import { CreateDriverDto } from '../dto/create-driver.dto';
import { UpdateDriverDto } from '../dto/update-driver.dto';
import { Auth } from '@/utils/decorators/auth.decorator';
import { Log } from '@/utils/decorators/log.decorator';
import { LogAction, LogEntity } from '@prisma/client';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Drivers')
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @Auth()
  @UseInterceptors(FileInterceptor('photo'))
  @Log({ action: LogAction.CREATE, entity: LogEntity.DRIVER })
  @ApiOperation({ summary: 'Crear un nuevo conductor' })
  @ApiBody({ type: CreateDriverDto })
  @ApiResponse({ status: 201, description: 'Conductor creado exitosamente' })
  async create(
    @Body('data') data: string,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    try {
      const dto: CreateDriverDto = JSON.parse(data);
      console.log('DTO recibido:', dto);
      const result = await this.driverService.create(dto, photo);
      console.log('Conductor creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en create controller:', error);
      throw error;
    }
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Obtener lista de conductores con paginación' })
  @ApiQuery({ name: 'teamId', required: true })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DISPONIBLE', 'EN_VIAJE', 'DESACTIVADO'],
  })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de conductores obtenida exitosamente',
  })
  findAll(
    @Query('teamId') teamId: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.driverService.findAll({
      teamId,
      status: status?.trim() || undefined,
      skip: parseInt(skip || '0', 10),
      take: parseInt(take || '10', 10),
      search: search?.trim() || undefined,
    });
  }

  @Get('paginated')
  @Auth()
  @ApiOperation({ summary: 'Obtener conductores con paginación avanzada' })
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  @ApiQuery({ name: 'teamId', required: true })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({
    status: 200,
    description: 'Conductores paginados obtenidos exitosamente',
  })
  getPaginatedDrivers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('teamId') teamId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.driverService.getPaginatedDrivers(
      parseInt(page, 10),
      parseInt(limit, 10),
      teamId,
      search?.trim() || undefined,
      status?.trim() || undefined,
    );
  }

  @Get('filters')
  @Auth()
  @ApiOperation({ summary: 'Obtener filtros disponibles para conductores' })
  @ApiOkResponse({
    schema: {
      example: { statusOptions: ['DISPONIBLE', 'EN_VIAJE', 'DESACTIVADO'] },
    },
  })
  getFilters() {
    return this.driverService.getFilters();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener conductor por ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Conductor encontrado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar conductor' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateDriverDto })
  @ApiResponse({
    status: 200,
    description: 'Conductor actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driverService.update(id, dto);
  }

  @Patch(':id/status')
  @Auth()
  @ApiOperation({ summary: 'Actualizar status del conductor' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['DISPONIBLE', 'EN_VIAJE', 'DESACTIVADO'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'DISPONIBLE' | 'EN_VIAJE' | 'DESACTIVADO' },
  ) {
    return this.driverService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Auth('OWNER', 'ADMIN')
  @ApiOperation({
    summary: 'Desactivar conductor (cambiar status a DESACTIVADO)',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Conductor desactivado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async remove(@Param('id') id: string) {
    return this.driverService.remove(id);
  }
}
