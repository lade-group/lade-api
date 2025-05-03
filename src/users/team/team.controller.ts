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

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly: TeamAccessService,
  ) {}

  @Auth()
  @Post()
  async createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req) {
    const userId = req.user.userId;
    return this.teamService.create({ ...createTeamDto, userId });
  }

  @Auth('OWNER', 'ADMIN')
  @Get(':teamId/users')
  getUsers(@Param('teamId') teamId: number) {
    return this.teamService.getTeamUsers(teamId);
  }

  @Auth('OWNER')
  @Patch(':teamId')
  updateTeam(@Param('teamId') teamId: number, @Req() req, @Body() body) {
    return this.teamService.updateTeam(teamId, req.user.userId, body);
  }

  @Auth('OWNER')
  @Delete(':teamId')
  deleteTeam(@Param('teamId') teamId: number, @Req() req) {
    return this.teamService.deleteTeam(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Delete(':teamId/users/:userId')
  removeUser(
    @Param('teamId') teamId: number,
    @Param('userId') userId: number,
    @Req() req,
  ) {
    return this.teamService.removeUserFromTeam(teamId, userId, req.user.userId);
  }

  @Auth('OWNER')
  @Patch(':teamId/transfer-ownership/:newOwnerId')
  transferOwnership(
    @Param('teamId') teamId: number,
    @Param('newOwnerId') newOwnerId: number,
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
  leaveTeam(@Param('teamId') teamId: number, @Req() req) {
    return this.teamService.leaveTeam(teamId, req.user.userId);
  }
}
