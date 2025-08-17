import { Module } from '@nestjs/common';
import { RoutePointController } from './routepoint.controller';
import { RoutePointService } from './routepoint.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [RoutePointController],
  providers: [RoutePointService, PrismaService],
  exports: [RoutePointService],
})
export class LocationsModule {}
