import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripCronService {
  private readonly logger = new Logger(TripCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updateTripStatuses() {
    this.logger.log(
      'Iniciando actualización automática de estatus de viajes...',
    );

    try {
      const now = new Date();

      // Actualizar viajes que deben cambiar a "EN_PROCESO"
      const tripsToStart = await this.prisma.trip.findMany({
        where: {
          status: TripStatus.NO_INICIADO,
          startDate: {
            lte: now,
          },
        },
      });

      if (tripsToStart.length > 0) {
        await this.prisma.trip.updateMany({
          where: {
            id: {
              in: tripsToStart.map((trip) => trip.id),
            },
          },
          data: {
            status: TripStatus.EN_PROCESO,
          },
        });

        this.logger.log(
          `Actualizados ${tripsToStart.length} viajes a EN_PROCESO`,
        );
      }

      // Actualizar viajes que deben cambiar a "FINALIZADO_CON_RETRASO"
      const tripsOverdue = await this.prisma.trip.findMany({
        where: {
          status: TripStatus.EN_PROCESO,
          endDate: {
            lt: now,
          },
        },
      });

      if (tripsOverdue.length > 0) {
        await this.prisma.trip.updateMany({
          where: {
            id: {
              in: tripsOverdue.map((trip) => trip.id),
            },
          },
          data: {
            status: TripStatus.FINALIZADO_CON_RETRASO,
          },
        });

        this.logger.log(
          `Actualizados ${tripsOverdue.length} viajes a FINALIZADO_CON_RETRASO`,
        );
      }

      this.logger.log(
        'Actualización automática de estatus de viajes completada',
      );
    } catch (error) {
      this.logger.error(
        'Error en la actualización automática de estatus de viajes:',
        error,
      );
    }
  }
}
