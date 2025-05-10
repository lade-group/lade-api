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
// import { UnitsService } from './units.service';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  //   constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva unidad vehicular' })
  @ApiResponse({ status: 201, description: 'Unidad creada exitosamente' })
  create(@Body() dto: CreateUnitDto) {
    // return this.unitsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las unidades de un equipo' })
  @ApiQuery({ name: 'teamId', required: true, description: 'ID del equipo' })
  @ApiResponse({ status: 200, description: 'Lista de unidades del equipo' })
  findAll(@Query('teamId') teamId: string) {
    // return this.unitsService.findAll(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una unidad por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la unidad' })
  @ApiResponse({ status: 200, description: 'Detalles de la unidad' })
  findOne(@Param('id') id: string) {
    // return this.unitsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una unidad vehicular' })
  @ApiParam({ name: 'id', description: 'ID de la unidad a actualizar' })
  @ApiResponse({ status: 200, description: 'Unidad actualizada exitosamente' })
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    // return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una unidad vehicular' })
  @ApiParam({ name: 'id', description: 'ID de la unidad a eliminar' })
  @ApiResponse({ status: 200, description: 'Unidad eliminada exitosamente' })
  remove(@Param('id') id: string) {
    // return this.unitsService.remove(id);
  }
}
