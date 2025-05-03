import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { AccountsModule } from './users/accounts.module';
import { GeolocationsModule } from './geolocation/geolocation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AccountsModule,
    GeolocationsModule,
    CommonModule,
  ],
})
export class AppModule {}
