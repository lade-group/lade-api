import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { UnitsModule } from './units/units.module';

@Module({ imports: [DriversModule, UnitsModule] })
export class OperatorsModule {}
