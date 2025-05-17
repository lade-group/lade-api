import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({ imports: [DriversModule, VehicleModule] })
export class OperatorsModule {}
