import { Global, Module } from '@nestjs/common';
import { DmsController } from './s3.controller';
import { DmsService } from './s3.service';

@Global()
@Module({
  controllers: [DmsController],
  providers: [DmsService],
  exports: [DmsService],
})
export class S3Module {}
