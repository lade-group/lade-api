import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '@/common/prisma/prisma.service';
// import { NotificationService } from '@/notifications/notification.service';
// import { MailerService } from '@nestjs-modules/mailer';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PrismaService,
    SubscriptionService,
    // NotificationService,
    // MailerService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
