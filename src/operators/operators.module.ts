import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DmsService } from '@/infraestructure/S3/s3.service';

@Module({
  imports: [DriversModule, VehicleModule],
  providers: [DmsService],
  exports: [DmsService],
})
export class OperatorsModule {}
