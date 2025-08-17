import {
  Controller,
  Post,
  Put,
  Param,
  Delete,
  Get,
  Query,
  Body,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientService } from './client.service';
import { Auth } from '@/utils/decorators/auth.decorator';
import { Log } from '@/utils/decorators/log.decorator';
import { LogAction, LogEntity } from '@prisma/client';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Auth()
  @Log({ action: LogAction.CREATE, entity: LogEntity.CLIENT })
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  async create(@Body() dto: CreateClientDto) {
    try {
      console.log('DTO recibido:', dto);
      const result = await this.clientService.create(dto);
      console.log('Cliente creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en create controller:', error);
      throw error;
    }
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar clientes paginados' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'ana' })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiQuery({ name: 'teamId', required: true, example: 'uuid-del-team' })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('teamId') teamId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    if (!teamId) {
      throw new BadRequestException('El teamId es obligatorio.');
    }
    return this.clientService.getPaginatedClients(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      teamId,
      search,
      status,
    );
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.clientService.findById(id);
  }

  @Put(':id')
  @Auth()
  @Log({
    action: LogAction.UPDATE,
    entity: LogEntity.CLIENT,
    entityIdParam: 'id',
  })
  @ApiOperation({ summary: 'Actualizar cliente' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(id, dto);
  }

  @Patch(':id/status')
  @Auth()
  @Log({
    action: LogAction.UPDATE,
    entity: LogEntity.CLIENT,
    entityIdParam: 'id',
  })
  @ApiOperation({ summary: 'Actualizar status del cliente' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ACTIVE', 'CANCELLED', 'DELETED'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'CANCELLED' | 'DELETED' },
  ) {
    return this.clientService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Auth('OWNER', 'ADMIN')
  @Log({
    action: LogAction.DELETE,
    entity: LogEntity.CLIENT,
    entityIdParam: 'id',
  })
  @ApiOperation({ summary: 'Desactivar cliente (cambiar status a CANCELLED)' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Cliente desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
