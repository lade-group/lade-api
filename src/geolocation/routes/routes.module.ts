import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [RouteController],
  providers: [RouteService, PrismaService],
  exports: [RouteService],
})
export class RoutesModule {}
