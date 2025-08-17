import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { RouteStatus } from '@prisma/client';

@Injectable()
export class RouteService {
  constructor(private prisma: PrismaService) {}

  async create(teamId: string, dto: CreateRouteDto) {
    const { stops, ...routeData } = dto;

    // Validar que el cliente existe y pertenece al equipo
    const client = await this.prisma.client.findFirst({
      where: { id: routeData.clientId, teamId },
    });

    if (!client) {
      throw new Error('Client not found or does not belong to the team');
    }

    // Validar que todos los puntos de ruta existen y pertenecen al equipo
    if (stops && stops.length > 0) {
      const pointIds = stops.map((stop) => stop.pointId);
      const existingPoints = await this.prisma.routePoint.findMany({
        where: {
          id: { in: pointIds },
          teamId,
        },
        select: { id: true },
      });

      if (existingPoints.length !== pointIds.length) {
        throw new Error(
          'One or more route points not found or do not belong to the team',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Crear la ruta
      const route = await tx.route.create({
        data: {
          ...routeData,
          teamId,
        },
        include: {
          client: true,
          team: true,
        },
      });

      // Crear las paradas
      if (stops && stops.length > 0) {
        await tx.stop.createMany({
          data: stops.map((stop) => ({
            routeId: route.id,
            pointId: stop.pointId,
            order: stop.order,
          })),
        });
      }

      // Retornar la ruta con sus paradas usando la transacción
      return tx.route.findFirst({
        where: { id: route.id, teamId },
        include: {
          client: true,
          team: true,
          stops: {
            include: {
              point: {
                include: {
                  address: true,
                  client: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async findAll(
    teamId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: RouteStatus,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      teamId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [routes, total] = await Promise.all([
      this.prisma.route.findMany({
        where,
        include: {
          client: true,
          team: true,
          stops: {
            include: {
              point: {
                include: {
                  address: true,
                  client: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where }),
    ]);

    return {
      data: routes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, teamId: string) {
    const route = await this.prisma.route.findFirst({
      where: { id, teamId },
      include: {
        client: true,
        team: true,
        stops: {
          include: {
            point: {
              include: {
                address: true,
                client: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(id: string, teamId: string, dto: UpdateRouteDto) {
    const route = await this.findOne(id, teamId);
    const { stops, ...routeData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Actualizar la ruta
      const updatedRoute = await tx.route.update({
        where: { id },
        data: routeData,
        include: {
          client: true,
          team: true,
        },
      });

      // Si se proporcionan nuevas paradas, actualizar las existentes
      if (stops) {
        // Eliminar paradas existentes
        await tx.stop.deleteMany({
          where: { routeId: id },
        });

        // Crear nuevas paradas
        if (stops.length > 0) {
          await tx.stop.createMany({
            data: stops.map((stop) => ({
              routeId: id,
              pointId: stop.pointId!,
              order: stop.order!,
            })),
          });
        }
      }

      // Retornar la ruta actualizada con sus paradas
      return this.findOne(id, teamId);
    });
  }

  async updateStatus(id: string, teamId: string, status: RouteStatus) {
    const route = await this.findOne(id, teamId);

    return this.prisma.route.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        team: true,
        stops: {
          include: {
            point: {
              include: {
                address: true,
                client: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string, teamId: string) {
    const route = await this.findOne(id, teamId);

    // Soft delete - cambiar status a DELETED
    return this.prisma.route.update({
      where: { id },
      data: { status: RouteStatus.DELETED },
      include: {
        client: true,
        team: true,
        stops: {
          include: {
            point: {
              include: {
                address: true,
                client: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }
}
