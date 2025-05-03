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
import { TeamAccessService } from './access.service';
import { Auth } from '@/utils/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Access Team')
@Controller('access-teams')
export class AccessController {
  constructor(private readonly teamAccessService: TeamAccessService) {}

  @Auth('OWNER')
  @Post(':teamId/generate-code')
  generateJoinCode(@Param('teamId') teamId: number, @Req() req) {
    return this.teamAccessService.generateJoinCode(teamId, req.user.userId);
  }

  @Auth('OWNER')
  @Post(':teamId/invite')
  inviteUserByEmail(
    @Param('teamId') teamId: number,
    @Body('email') email: string,
  ) {
    return this.teamAccessService.inviteUserByEmail(teamId, email);
  }

  @Auth()
  @Post('join-by-code')
  joinByCode(@Req() req, @Body('code') code: string) {
    return this.teamAccessService.joinTeamByCode(req.user.userId, code);
  }

  @Auth()
  @Post(':teamId/accept-invitation')
  acceptInvitation(@Param('teamId') teamId: number, @Req() req) {
    return this.teamAccessService.acceptTeamInvitation(req.user.userId, teamId);
  }
}
