import { Module } from '@nestjs/common';
import { TripModule } from './trip.module';

@Module({
  imports: [TripModule],
  exports: [TripModule],
})
export class TripsModule {}
