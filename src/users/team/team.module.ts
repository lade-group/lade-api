import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamAccessService } from './access.service';
import { AccessController } from './access.controller';
import { DmsService } from '@/infraestructure/S3/s3.service';

@Module({
  controllers: [TeamController, AccessController],
  providers: [TeamService, TeamAccessService, DmsService],
  exports: [TeamService, TeamAccessService],
})
export class TeamModule {}
