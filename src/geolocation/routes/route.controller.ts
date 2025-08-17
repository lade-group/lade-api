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
import { RouteService } from './route.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { Auth } from '@/utils/decorators/auth.decorator';
import { Log } from '@/utils/decorators/log.decorator';
import { LogAction, LogEntity, RouteStatus } from '@prisma/client';
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

@ApiTags('Routes')
@Controller('route')
export class RouteController {
  constructor(
    private readonly routeService: RouteService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('test')
  async test() {
    return 'test';
  }

  @Post()
  @Auth()
  @Log({ action: LogAction.CREATE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Crear una nueva ruta' })
  @ApiBody({ type: CreateRouteDto })
  @ApiResponse({
    status: 201,
    description: 'Ruta creada exitosamente',
  })
  async create(@Body() dto: CreateRouteDto, @Req() req: any) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routeService.create(userTeam.teamId, dto);
    //return 'test';
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Obtener todas las rutas del equipo' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RouteStatus })
  @ApiOkResponse({ description: 'Lista de rutas' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
    @Query('search') search?: string,
    @Query('status') status?: RouteStatus,
  ) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routeService.findAll(
      userTeam.teamId,
      parseInt(page),
      parseInt(limit),
      search,
      status,
    );
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener una ruta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la ruta' })
  @ApiOkResponse({ description: 'Ruta encontrada' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routeService.findOne(id, userTeam.teamId);
  }

  @Patch(':id')
  @Auth()
  @Log({ action: LogAction.UPDATE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Actualizar una ruta' })
  @ApiParam({ name: 'id', description: 'ID de la ruta' })
  @ApiBody({ type: UpdateRouteDto })
  @ApiOkResponse({ description: 'Ruta actualizada exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
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

    return this.routeService.update(id, userTeam.teamId, dto);
  }

  @Patch(':id/status')
  @Auth()
  @Log({ action: LogAction.UPDATE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Actualizar el estado de una ruta' })
  @ApiParam({ name: 'id', description: 'ID de la ruta' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { status: { enum: Object.values(RouteStatus) } },
    },
  })
  @ApiOkResponse({
    description: 'Estado de la ruta actualizado exitosamente',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RouteStatus },
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

    return this.routeService.updateStatus(id, userTeam.teamId, body.status);
  }

  @Delete(':id')
  @Auth()
  @Log({ action: LogAction.DELETE, entity: LogEntity.ROUTE })
  @ApiOperation({ summary: 'Eliminar una ruta (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la ruta' })
  @ApiOkResponse({ description: 'Ruta eliminada exitosamente' })
  async remove(@Param('id') id: string, @Req() req: any) {
    // Obtener el teamId del usuario desde la base de datos
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: { userId: req.user.userId },
      select: { teamId: true },
    });

    if (!userTeam) {
      throw new Error('User not associated with any team');
    }

    return this.routeService.remove(id, userTeam.teamId);
  }
}
