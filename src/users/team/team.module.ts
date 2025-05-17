import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamAccessService } from './access.service';
import { AccessController } from './access.controller';

@Module({
  controllers: [TeamController, AccessController],
  providers: [TeamService, TeamAccessService],
  exports: [TeamService, TeamAccessService],
})
export class TeamModule {}
