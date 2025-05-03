import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/common/prisma/prisma.service';
// import { NotificationService } from '@/notifications/notification.service';
// import { MailerService } from '@nestjs-modules/mailer';
import { addDays, isBefore, isAfter } from 'date-fns';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly notificationService: NotificationService,
    // private readonly mailerService: MailerService,
  ) {}

  /**
   * Scheduled job that runs daily to check subscription statuses
   * and trigger transitions, notifications, or email alerts.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkSubscriptions() {
    this.logger.log('Checking subscription statuses...');
    const subscriptions = await this.prisma.subscription.findMany({
      include: { team: true },
    });

    const today = new Date();

    for (const sub of subscriptions) {
      const expiresAt = sub.expiresAt;

      if (isBefore(expiresAt, today) && sub.status !== 'EXPIRED') {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        // await this.notificationService.sendToTeam(
        //   sub.teamId,
        //   'Subscription expired',
        // );

        // await this.mailerService.sendMail({
        //   to: sub.team.ownerEmail,
        //   subject: 'Your subscription has expired',
        //   text: 'Access to editing features is now disabled until renewal.',
        // });
      }

      if (
        isAfter(expiresAt, today) &&
        isBefore(expiresAt, addDays(today, 3)) &&
        sub.status === 'ACTIVE'
      ) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRING_SOON' },
        });

        // await this.notificationService.sendToTeam(
        //   sub.teamId,
        //   'Your subscription is expiring soon',
        // );

        // await this.mailerService.sendMail({
        //   to: sub.team.ownerEmail,
        //   subject: 'Your subscription is expiring soon',
        //   text: 'Please renew soon to avoid service interruption.',
        // });
      }
    }
  }
}
