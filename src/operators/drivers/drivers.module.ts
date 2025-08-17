import { Module } from '@nestjs/common';
import { DriverController } from './drivers.controller';
import { DriverService } from './drivers.service';
import { DriverDocumentsController } from './driver-documents.controller';
import { DmsService } from '@/infraestructure/S3/s3.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [DriverController, DriverDocumentsController],
  providers: [DriverService, DmsService, PrismaService],
})
export class DriversModule {}
