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

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  async create(@Body() dto: CreateClientDto) {
    console.log(dto);
    return this.clientService.create(dto);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar clientes paginados' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'ana' })
  @ApiQuery({ name: 'status', required: false, example: 'Activo' })
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
  @ApiOperation({ summary: 'Actualizar cliente' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateClientDto })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(id, dto);
  }

  @Delete(':id')
  @Auth('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar cliente' })
  @ApiParam({ name: 'id', required: true })
  async remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
