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

  @Auth('OWNER', 'ADMIN')
  @Post(':teamId/invite')
  inviteUserByEmail(
    @Param('teamId') teamId: string,
    @Body() body: { email: string },
  ) {
    return this.teamAccessService.inviteSingleUserToTeam(teamId, body.email);
  }

  @Auth()
  @Post(':teamId/accept-invitation')
  acceptInvitation(@Param('teamId') teamId: string, @Req() req) {
    return this.teamAccessService.acceptTeamInvitation(req.user.userId, teamId);
  }

  @Auth()
  @Get(':teamId/invitations')
  getPendingInvites(@Param('teamId') teamId: string) {
    return this.teamAccessService.getTeamInvitations(teamId);
  }
}
