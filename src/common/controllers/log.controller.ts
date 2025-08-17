import { Controller, Get, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LogService } from '@/common/services/log.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Auth } from '@/utils/decorators/auth.decorator';
import { LogInterceptor } from '@/utils/interceptors/log.interceptor';

@Controller('logs')
@UseInterceptors(LogInterceptor)
export class LogController {
  constructor(
    private readonly logService: LogService,
    private readonly prisma: PrismaService,
  ) {}

  @Auth()
  @Get('team')
  @ApiOperation({ summary: 'Obtener logs del equipo' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Logs obtenidos exitosamente' })
  async getTeamLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ) {
    // Obtener el teamId del usuario actual
    const teamId = req.user.teamId;

    if (!teamId) {
      // Si no hay teamId en el token, intentar obtenerlo de la base de datos
      try {
        const userTeams = await this.prisma.usersOnTeams.findFirst({
          where: { userId: req.user.userId },
          select: { teamId: true },
        });

        if (!userTeams) {
          return {
            logs: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }

        return this.logService.getLogsByTeam(
          userTeams.teamId,
          parseInt(page),
          parseInt(limit),
        );
      } catch (error) {
        console.error('Error obteniendo teamId del usuario:', error);
        return {
          logs: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
    }

    return this.logService.getLogsByTeam(
      teamId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Auth()
  @Get('user')
  @ApiOperation({ summary: 'Obtener logs del usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Logs obtenidos exitosamente' })
  async getUserLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.logService.getLogsByUser(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }
}
