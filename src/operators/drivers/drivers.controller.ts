import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
// import { DriversService } from './drivers.service';
import { CreateDriverDto } from '../dto/create-driver.dto';
import { UpdateDriverDto } from '../dto/update-driver.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  //   constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo conductor' })
  @ApiResponse({ status: 201, description: 'Conductor creado exitosamente' })
  create(@Body() dto: CreateDriverDto) {
    // return this.driversService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los conductores de un equipo' })
  @ApiQuery({ name: 'teamId', required: true, description: 'ID del equipo' })
  @ApiResponse({ status: 200, description: 'Lista de conductores del equipo' })
  findAll(@Query('teamId') teamId: string) {
    // return this.driversService.findAll(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un conductor por su ID' })
  @ApiParam({ name: 'id', description: 'ID del conductor' })
  @ApiResponse({ status: 200, description: 'Detalles del conductor' })
  findOne(@Param('id') id: string) {
    // return this.driversService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar información de un conductor' })
  @ApiParam({ name: 'id', description: 'ID del conductor a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Conductor actualizado exitosamente',
  })
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    // return this.driversService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un conductor' })
  @ApiParam({ name: 'id', description: 'ID del conductor a eliminar' })
  @ApiResponse({ status: 200, description: 'Conductor eliminado exitosamente' })
  remove(@Param('id') id: string) {
    // return this.driversService.remove(id);
  }
}
