import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { LogAction, LogEntity } from '@prisma/client';

export interface LogData {
  action: LogAction;
  entity: LogEntity;
  entityId: string;
  userId: string;
  teamId: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(logData: LogData) {
    try {
      return await this.prisma.log.create({
        data: {
          action: logData.action,
          entity: logData.entity,
          entityId: logData.entityId,
          userId: logData.userId,
          teamId: logData.teamId,
          metadata: logData.metadata || {},
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating log:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  async getLogsByTeam(teamId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where: { teamId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where: { teamId } }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLogsByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where: { userId } }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLogsByEntity(
    entity: LogEntity,
    entityId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where: { entity, entityId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where: { entity, entityId } }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
