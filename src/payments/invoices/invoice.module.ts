import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { FacturapiService } from '../../common/services/facturapi.service';
import { DmsService } from '../../infraestructure/S3/s3.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, FacturapiService, DmsService, PrismaService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
