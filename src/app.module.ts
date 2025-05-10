import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { AccountsModule } from './users/accounts.module';
import { GeolocationsModule } from './geolocation/geolocation.module';
import { CustomersModule } from './customer/customers.module';
import { OperatorsModule } from './operators/operators.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AccountsModule,
    CustomersModule,
    OperatorsModule,
    GeolocationsModule,
    CommonModule,
  ],
})
export class AppModule {}
