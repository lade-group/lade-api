import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripCronService } from './trip-cron.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InvoiceService } from '../../payments/invoices/invoice.service';
import { FacturapiService } from '../../common/services/facturapi.service';
import { DmsService } from '../../infraestructure/S3/s3.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TripController],
  providers: [
    TripService,
    TripCronService,
    PrismaService,
    InvoiceService,
    FacturapiService,
    DmsService,
  ],
  exports: [TripService],
})
export class TripModule {}
