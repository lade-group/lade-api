import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRoutePointDto } from '../dto/create-routepoint.dto';
import { UpdateRoutePointDto } from '../dto/update-routepoint.dto';
import { RoutePointStatus } from '@prisma/client';

@Injectable()
export class RoutePointService {
  constructor(private prisma: PrismaService) {}

  async create(teamId: string, dto: CreateRoutePointDto) {
    return this.prisma.routePoint.create({
      data: {
        ...dto,
        teamId,
        status: dto.status || RoutePointStatus.ACTIVE,
      },
      include: {
        address: true,
        client: true,
        team: true,
      },
    });
  }

  async findAll(
    teamId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: RoutePointStatus,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      teamId,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    const [routePoints, total] = await Promise.all([
      this.prisma.routePoint.findMany({
        where,
        include: {
          address: true,
          client: true,
          team: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.routePoint.count({ where }),
    ]);

    return {
      data: routePoints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, teamId: string) {
    const routePoint = await this.prisma.routePoint.findFirst({
      where: { id, teamId },
      include: {
        address: true,
        client: true,
        team: true,
      },
    });

    if (!routePoint) {
      throw new NotFoundException('RoutePoint not found');
    }

    return routePoint;
  }

  async update(id: string, teamId: string, dto: UpdateRoutePointDto) {
    const routePoint = await this.findOne(id, teamId);

    return this.prisma.routePoint.update({
      where: { id },
      data: dto,
      include: {
        address: true,
        client: true,
        team: true,
      },
    });
  }

  async updateStatus(id: string, teamId: string, status: RoutePointStatus) {
    const routePoint = await this.findOne(id, teamId);

    return this.prisma.routePoint.update({
      where: { id },
      data: { status },
      include: {
        address: true,
        client: true,
        team: true,
      },
    });
  }

  async remove(id: string, teamId: string) {
    const routePoint = await this.findOne(id, teamId);

    // Soft delete - cambiar status a DELETED
    return this.prisma.routePoint.update({
      where: { id },
      data: { status: RoutePointStatus.DELETED },
      include: {
        address: true,
        client: true,
        team: true,
      },
    });
  }
}
