import { Global, Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Global()
@Module({
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
