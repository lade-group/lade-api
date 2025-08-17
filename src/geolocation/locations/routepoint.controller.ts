import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { RoutePointService } from './routepoint.service';
import { CreateRoutePointDto } from '../dto/create-routepoint.dto';
import { UpdateRoutePointDto } from '../dto/update-routepoint.dto';
import { Auth } from '@/utils/decorators/auth.decorator';
import { Log } from '@/utils/decorators/log.decorator';
import { LogAction, LogEntity, RoutePointStatus } from '@prisma/client';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PrismaService } from '@/common/prisma/prisma.service';

@ApiTags('RoutePoints')
@Controller('routepoint')
export class RoutePointController {
  constructor(
    private readonly routePointService: RoutePointService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Auth()
  @Log({ action: LogAction.CREATE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Crear un nuevo punto de ruta' })
  @ApiBody({ type: CreateRoutePointDto })
  @ApiResponse({
    status: 201,
    description: 'Punto de ruta creado exitosamente',
  })
  async create(@Body() dto: CreateRoutePointDto, @Req() req: any) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routePointService.create(userTeam.teamId, dto);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Obtener todos los puntos de ruta del equipo' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RoutePointStatus })
  @ApiOkResponse({ description: 'Lista de puntos de ruta' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
    @Query('name') name?: string,
    @Query('status') status?: RoutePointStatus,
  ) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routePointService.findAll(
      userTeam.teamId,
      parseInt(page),
      parseInt(limit),
      name,
      status,
    );
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener un punto de ruta por ID' })
  @ApiParam({ name: 'id', description: 'ID del punto de ruta' })
  @ApiOkResponse({ description: 'Punto de ruta encontrado' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routePointService.findOne(id, userTeam.teamId);
  }

  @Patch(':id')
  @Auth()
  @Log({ action: LogAction.UPDATE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Actualizar un punto de ruta' })
  @ApiParam({ name: 'id', description: 'ID del punto de ruta' })
  @ApiBody({ type: UpdateRoutePointDto })
  @ApiOkResponse({ description: 'Punto de ruta actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoutePointDto,
    @Req() req: any,
  ) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routePointService.update(id, userTeam.teamId, dto);
  }

  @Patch(':id/status')
  @Auth()
  @Log({ action: LogAction.UPDATE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Actualizar el estado de un punto de ruta' })
  @ApiParam({ name: 'id', description: 'ID del punto de ruta' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { status: { enum: Object.values(RoutePointStatus) } },
    },
  })
  @ApiOkResponse({
    description: 'Estado del punto de ruta actualizado exitosamente',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RoutePointStatus },
    @Req() req: any,
  ) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routePointService.updateStatus(
      id,
      userTeam.teamId,
      body.status,
    );
  }

  @Delete(':id')
  @Auth()
  @Log({ action: LogAction.DELETE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Eliminar un punto de ruta (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del punto de ruta' })
  @ApiOkResponse({ description: 'Punto de ruta eliminado exitosamente' })
  async remove(@Param('id') id: string, @Req() req: any) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routePointService.remove(id, userTeam.teamId);
  }
}
