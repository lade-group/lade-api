import { Module } from '@nestjs/common';
import { LogService } from '@/common/services/log.service';
import { LogController } from '@/common/controllers/log.controller';
import { LogInterceptor } from '@/utils/interceptors/log.interceptor';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  providers: [LogService, LogInterceptor, PrismaService],
  controllers: [LogController],
  exports: [LogService, LogInterceptor],
})
export class LogModule {}
