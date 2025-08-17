import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeamService } from './team.service';
import { TeamAccessService } from './access.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { Auth } from '@/utils/decorators/auth.decorator';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Log } from '@/utils/decorators/log.decorator';
import { LogAction, LogEntity } from '@prisma/client';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly: TeamAccessService,
  ) {}

  @Auth()
  @Get('mine')
  @ApiOperation({ summary: 'Obtener equipos del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Equipos del usuario obtenidos exitosamente',
  })
  async getUserTeams(@Req() req) {
    console.log('getUserTeams endpoint called');
    const userId = req.user.userId;
    console.log('User ID from request:', userId);
    const result = await this.teamService.getTeamsForUser(userId);
    console.log('Result from service:', result);
    return result;
  }

  @Auth()
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @Log({ action: LogAction.CREATE, entity: LogEntity.TEAM })
  @ApiOperation({ summary: 'Crear nuevo equipo' })
  @ApiBody({ type: CreateTeamDto })
  async createTeam(
    @Body('data') data: string,
    @Req() req,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    console.log('logo', logo);
    console.log('data', data);
    console.log('req', req);
    console.log('req.user', req.user);

    const dto: CreateTeamDto = JSON.parse(data);
    const userId = req.user.userId;
    return this.teamService.create({ ...dto, userId }, logo);
  }

  @Auth()
  @Get(':teamId/users')
  getUsers(@Param('teamId') teamId: string) {
    return this.teamService.getTeamUsers(teamId);
  }

  @Auth()
  @Get(':teamId')
  @ApiOperation({ summary: 'Obtener información del equipo' })
  @ApiResponse({
    status: 200,
    description: 'Información del equipo obtenida exitosamente',
  })
  getTeamById(@Param('teamId') teamId: string, @Req() req) {
    return this.teamService.getTeamById(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Patch(':teamId')
  @Log({
    action: LogAction.UPDATE,
    entity: LogEntity.TEAM,
    entityIdParam: 'teamId',
  })
  @ApiOperation({ summary: 'Actualizar información del equipo' })
  @ApiBody({ type: UpdateTeamDto })
  @ApiResponse({ status: 200, description: 'Equipo actualizado exitosamente' })
  updateTeam(
    @Param('teamId') teamId: string,
    @Req() req,
    @Body() body: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(teamId, req.user.userId, body);
  }

  @Auth('OWNER')
  @Patch(':teamId/deactivate')
  @Log({
    action: LogAction.DEACTIVATE,
    entity: LogEntity.TEAM,
    entityIdParam: 'teamId',
  })
  @ApiOperation({ summary: 'Desactivar equipo' })
  @ApiResponse({ status: 200, description: 'Equipo desactivado exitosamente' })
  deactivateTeam(@Param('teamId') teamId: string, @Req() req) {
    return this.teamService.deactivateTeam(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Patch(':teamId/reactivate')
  @Log({
    action: LogAction.REACTIVATE,
    entity: LogEntity.TEAM,
    entityIdParam: 'teamId',
  })
  @ApiOperation({ summary: 'Reactivar equipo' })
  @ApiResponse({ status: 200, description: 'Equipo reactivado exitosamente' })
  reactivateTeam(@Param('teamId') teamId: string, @Req() req) {
    return this.teamService.reactivateTeam(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Patch(':teamId/suspend')
  @Log({
    action: LogAction.DEACTIVATE,
    entity: LogEntity.TEAM,
    entityIdParam: 'teamId',
  })
  @ApiOperation({ summary: 'Suspender equipo' })
  @ApiResponse({ status: 200, description: 'Equipo suspendido exitosamente' })
  suspendTeam(@Param('teamId') teamId: string, @Req() req) {
    return this.teamService.suspendTeam(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Patch(':teamId/address')
  @Log({
    action: LogAction.UPDATE,
    entity: LogEntity.ADDRESS,
    entityIdParam: 'teamId',
  })
  @ApiOperation({ summary: 'Actualizar dirección del equipo' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada exitosamente',
  })
  updateTeamAddress(
    @Param('teamId') teamId: string,
    @Req() req,
    @Body() addressData: UpdateAddressDto,
  ) {
    return this.teamService.updateTeamAddress(
      teamId,
      req.user.userId,
      addressData,
    );
  }

  @Auth('OWNER')
  @Delete(':teamId')
  deleteTeam(@Param('teamId') teamId: string, @Req() req) {
    return this.teamService.deleteTeam(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Delete(':teamId/users/:userId')
  removeUser(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.teamService.removeUserFromTeam(teamId, userId, req.user.userId);
  }

  @Auth('OWNER')
  @Patch(':teamId/transfer-ownership/:newOwnerId')
  transferOwnership(
    @Param('teamId') teamId: string,
    @Param('newOwnerId') newOwnerId: string,
    @Req() req,
  ) {
    return this.teamService.transferOwnership(
      teamId,
      newOwnerId,
      req.user.userId,
    );
  }

  @Auth()
  @Delete(':teamId/leave')
  leaveTeam(@Param('teamId') teamId: string, @Req() req) {
    return this.teamService.leaveTeam(teamId, req.user.userId);
  }
}
