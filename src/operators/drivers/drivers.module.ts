import { Module } from '@nestjs/common';
import { DriverController } from './drivers.controller';
import { DriverService } from './drivers.service';

@Module({ controllers: [DriverController], providers: [DriverService] })
export class DriversModule {}
