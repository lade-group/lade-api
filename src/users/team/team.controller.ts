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
} from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamAccessService } from './access.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { Auth } from '@/utils/decorators/auth.decorator';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly: TeamAccessService,
  ) {}

  @Auth()
  @Post()
  @ApiOperation({ summary: 'Crear nuevo equipo' })
  @ApiBody({ type: CreateTeamDto })
  async createTeam(@Body() dto: CreateTeamDto, @Req() req) {
    const userId = req.user.userId;
    return this.teamService.create({ ...dto, userId });
  }

  @Auth()
  @Get(':teamId/users')
  getUsers(@Param('teamId') teamId: string) {
    return this.teamService.getTeamUsers(teamId);
  }

  @Auth('OWNER')
  @Patch(':teamId')
  updateTeam(@Param('teamId') teamId: string, @Req() req, @Body() body) {
    return this.teamService.updateTeam(teamId, req.user.userId, body);
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

  @Auth()
  @Get('mine')
  async getUserTeams(@Req() req) {
    const userId = req.user.userId;
    console.log(userId);
    return this.teamService.getTeamsForUser(userId);
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
