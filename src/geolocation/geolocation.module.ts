import { Module } from '@nestjs/common';
import { AddressModule } from './address/address.module';
import { LocationsModule } from './locations/locations.module';
import { RoutesModule } from './routes/routes.module';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [AddressModule, LocationsModule, RoutesModule, TripsModule],
})
export class GeolocationsModule {}
