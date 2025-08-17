import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { AccountsModule } from './users/accounts.module';
import { GeolocationsModule } from './geolocation/geolocation.module';
import { CustomersModule } from './customer/customers.module';
import { OperatorsModule } from './operators/operators.module';
import { S3Module } from './infraestructure/S3/s3.module';
import { LogModule } from './common/modules/log.module';
import { InvoiceModule } from './payments/invoices/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AccountsModule,
    CustomersModule,
    OperatorsModule,
    GeolocationsModule,
    CommonModule,
    S3Module,
    LogModule,
    InvoiceModule,
  ],
})
export class AppModule {}
